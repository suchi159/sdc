import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoTile } from "@/components/VideoTile";
import { toast } from "sonner";
import {
  Loader2, Eye, AlertTriangle, Flag, Activity, Users, Clock, Shield,
  Zap, Video, VideoOff, Wifi, WifiOff, Maximize2, Minimize2
} from "lucide-react";

const INCIDENT_TYPES = [
  { value: "gaze_deviation", label: "Gaze Deviation", color: "bg-yellow-500" },
  { value: "face_not_detected", label: "Face Not Detected", color: "bg-orange-500" },
  { value: "multiple_faces", label: "Multiple Faces", color: "bg-red-500" },
  { value: "audio_anomaly", label: "Audio Anomaly", color: "bg-yellow-400" },
  { value: "tab_switch", label: "Tab Switch", color: "bg-orange-400" },
  { value: "phone_detected", label: "Phone Detected", color: "bg-red-400" },
  { value: "notebook_detected", label: "Notebook Detected", color: "bg-red-600" },
  { value: "second_monitor", label: "Second Monitor", color: "bg-red-700" },
  { value: "screen_share_detected", label: "Screen Share", color: "bg-red-800" },
  { value: "identity_mismatch", label: "Identity Mismatch", color: "bg-purple-600" },
  { value: "manual_flag", label: "Manual Flag", color: "bg-gray-600" },
] as const;

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  medium: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  high: "text-red-600 bg-red-50 dark:bg-red-900/20",
  critical: "text-red-800 bg-red-100 dark:bg-red-900/40",
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// Per-session WebRTC state for the proctor viewer
interface SessionStream {
  sessionId: number;
  stream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  signalingState: "disconnected" | "connecting" | "connected";
}

function useProctorWebRTC(sessionId: number | null) {
  const [streams, setStreams] = useState<Record<number, SessionStream>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const pcsRef = useRef<Record<number, RTCPeerConnection>>({});
  const pendingCandidates = useRef<Record<number, RTCIceCandidateInit[]>>({});

  const getWsUrl = () => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/ws/webrtc`;
  };

  const updateStream = useCallback((id: number, update: Partial<SessionStream>) => {
    setStreams(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { sessionId: id, stream: null, connectionState: "new" as RTCPeerConnectionState, signalingState: "disconnected" as const }),
        ...update,
      },
    }));
  }, []);

  const connectToSession = useCallback((sid: number) => {
    if (pcsRef.current[sid]) return; // already connected

    updateStream(sid, { signalingState: "connecting" });

    const ensureWs = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return wsRef.current;
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws/webrtc`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Join all active sessions
        Object.keys(pcsRef.current).forEach(id => {
          ws.send(JSON.stringify({ type: "join", sessionId: String(id), role: "proctor" }));
        });
      };

      ws.onmessage = async (event) => {
        let msg: any;
        try { msg = JSON.parse(event.data); } catch { return; }
        const msgSid = parseInt(msg.sessionId);
        if (!msgSid) return;

        if (msg.type === "offer") {
          const pc = pcsRef.current[msgSid];
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          for (const c of (pendingCandidates.current[msgSid] || [])) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current[msgSid] = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sessionId: String(msgSid), role: "proctor", payload: answer }));
        }

        if (msg.type === "ice-candidate") {
          const pc = pcsRef.current[msgSid];
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
          } else {
            if (!pendingCandidates.current[msgSid]) pendingCandidates.current[msgSid] = [];
            pendingCandidates.current[msgSid].push(msg.payload);
          }
        }
      };

      return ws;
    };

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcsRef.current[sid] = pc;

    pc.ontrack = (e) => {
      updateStream(sid, { stream: e.streams[0] });
    };

    pc.onconnectionstatechange = () => {
      updateStream(sid, { connectionState: pc.connectionState });
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          sessionId: String(sid),
          role: "proctor",
          payload: e.candidate.toJSON(),
        }));
      }
    };

    const ws = ensureWs();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "join", sessionId: String(sid), role: "proctor" }));
      updateStream(sid, { signalingState: "connected" });
    }
  }, [updateStream]);

  const disconnectFromSession = useCallback((sid: number) => {
    pcsRef.current[sid]?.close();
    delete pcsRef.current[sid];
    setStreams(prev => {
      const next = { ...prev };
      delete next[sid];
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(pcsRef.current).forEach(pc => pc.close());
      wsRef.current?.close();
    };
  }, []);

  return { streams, connectToSession, disconnectFromSession };
}

export default function LiveProctorMonitor() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [flagType, setFlagType] = useState<string>("gaze_deviation");
  const [flagSeverity, setFlagSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [webrtcEnabled, setWebrtcEnabled] = useState(false);

  const { streams, connectToSession, disconnectFromSession } = useProctorWebRTC(selectedSession);

  const { data: stats } = trpc.proctoring.dashboardStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: activeSessions = [], refetch: refetchSessions } = trpc.proctoring.liveMonitor.activeSessions.useQuery(undefined, { refetchInterval: 15000 });
  const { data: sessionDetail, refetch: refetchDetail } = trpc.proctoring.liveMonitor.sessionDetail.useQuery(
    { sessionId: selectedSession! },
    { enabled: !!selectedSession, refetchInterval: 10000 }
  );

  const flagMutation = trpc.proctoring.liveMonitor.flagIncident.useMutation({
    onSuccess: () => {
      refetchSessions();
      if (selectedSession) refetchDetail();
      toast.success("Incident flagged");
    },
    onError: (e) => toast.error(e.message),
  });

  const analyzeMutation = trpc.proctoring.liveMonitor.analyzeSession.useMutation({
    onSuccess: (data) => {
      toast.info(`AI Analysis: ${data.risk.toUpperCase()} risk — ${data.summary}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFlag = () => {
    if (!selectedSession) { toast.error("Select a session first"); return; }
    flagMutation.mutate({ sessionId: selectedSession, type: flagType as any, severity: flagSeverity });
  };

  const toggleWebRTC = (sid: number) => {
    if (streams[sid]) {
      disconnectFromSession(sid);
    } else {
      connectToSession(sid);
      toast.info(`Connecting to session #${sid} video feed...`);
    }
  };

  const getRiskLevel = (incidentCount: number): "low" | "medium" | "high" | "critical" => {
    if (incidentCount >= 5) return "critical";
    if (incidentCount >= 3) return "high";
    if (incidentCount >= 1) return "medium";
    return "low";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Proctor Monitor</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time exam session oversight with WebRTC video and AI flag detection</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={webrtcEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setWebrtcEnabled(v => !v)}
            className="gap-2"
          >
            {webrtcEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            {webrtcEnabled ? "Video On" : "Enable Video"}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Sessions", value: stats?.active ?? activeSessions.length, icon: <Activity className="h-5 w-5 text-green-500" />, color: "text-green-600" },
          { label: "Flagged", value: stats?.flagged ?? 0, icon: <AlertTriangle className="h-5 w-5 text-red-500" />, color: "text-red-600" },
          { label: "Completed Today", value: stats?.completed ?? 0, icon: <Shield className="h-5 w-5 text-blue-500" />, color: "text-blue-600" },
          { label: "Total Incidents", value: stats?.totalIncidents ?? 0, icon: <Flag className="h-5 w-5 text-orange-500" />, color: "text-orange-600" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WebRTC info banner */}
      {webrtcEnabled && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
          <Wifi className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Live Video Mode Active</strong> — Click the video icon on any session tile to connect a WebRTC stream.
            Candidates must be on the exam page for their video to appear. Uses peer-to-peer WebRTC with STUN servers — no third-party service required.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Sessions ({activeSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active sessions right now</p>
                  <p className="text-xs mt-1">Sessions will appear here when candidates start exams</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeSessions.map(session => {
                    const riskLevel = getRiskLevel(session.incidentCount ?? 0);
                    const sessionStream = streams[session.id];
                    const isExpanded = expandedSession === session.id;

                    return (
                      <div
                        key={session.id}
                        className={`border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                          selectedSession === session.id ? "border-primary" : "border-border"
                        }`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        {/* Video area */}
                        {webrtcEnabled ? (
                          <div className={isExpanded ? "h-48" : "h-28"}>
                            <VideoTile
                              stream={sessionStream?.stream ?? null}
                              label={`Session #${session.id}`}
                              isConnected={sessionStream?.connectionState === "connected"}
                              riskLevel={riskLevel}
                              incidentCount={session.incidentCount ?? 0}
                              className="w-full h-full rounded-none border-0"
                            />
                          </div>
                        ) : (
                          <div className="h-20 bg-slate-900 flex items-center justify-center">
                            <div className="text-center text-slate-500">
                              <Eye className="h-5 w-5 mx-auto" />
                              <p className="text-xs mt-1">Enable video to view feed</p>
                            </div>
                          </div>
                        )}

                        {/* Session info */}
                        <div className="p-3 bg-card">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">Session #{session.id}</span>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={riskLevel === "critical" ? "destructive" : "outline"} className="text-xs">
                                {session.incidentCount} flags
                              </Badge>
                              {webrtcEnabled && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => { e.stopPropagation(); toggleWebRTC(session.id); }}
                                  title={sessionStream ? "Disconnect video" : "Connect video"}
                                >
                                  {sessionStream?.connectionState === "connected"
                                    ? <Wifi className="h-3.5 w-3.5 text-green-500" />
                                    : <WifiOff className="h-3.5 w-3.5 text-slate-400" />
                                  }
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); setExpandedSession(isExpanded ? null : session.id); }}
                              >
                                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.startedAt ? new Date(session.startedAt).toLocaleTimeString() : "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {session.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Detail */}
          {selectedSession && sessionDetail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Session #{selectedSession} — Incident Timeline</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => analyzeMutation.mutate({ sessionId: selectedSession })}
                    disabled={analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                    AI Analysis
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionDetail.incidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No incidents recorded</p>
                ) : (
                  <div className="space-y-2">
                    {sessionDetail.incidents.map(inc => (
                      <div key={inc.id} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${SEVERITY_COLORS[inc.severity]}`}>
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{inc.type.replace(/_/g, " ")}</span>
                            <Badge variant="outline" className="text-xs py-0">{inc.severity}</Badge>
                          </div>
                          {inc.description && <p className="text-xs opacity-80 mt-0.5">{inc.description}</p>}
                          <p className="text-xs opacity-60 mt-0.5">{new Date(inc.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                Flag Incident
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Incident Type</label>
                <Select value={flagType} onValueChange={setFlagType}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Severity</label>
                <Select value={flagSeverity} onValueChange={v => setFlagSeverity(v as any)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                variant="destructive"
                size="sm"
                onClick={handleFlag}
                disabled={flagMutation.isPending || !selectedSession}
              >
                {flagMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Flag className="h-4 w-4 mr-1" />}
                {selectedSession ? "Flag Incident" : "Select a Session First"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">AI Detection Types</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {INCIDENT_TYPES.map(t => (
                <div key={t.value} className="flex items-center gap-2 text-xs">
                  <div className={`h-2 w-2 rounded-full ${t.color}`} />
                  <span>{t.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recording Policy</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>All session recordings are retained for <strong>365 days</strong> from the exam date.</p>
              <p>Recordings are encrypted at rest and accessible only to authorized proctors and org admins.</p>
              <p>Flagged sessions are automatically escalated for human review within 24 hours.</p>
              <p className="text-blue-400">WebRTC streams use peer-to-peer encryption (DTLS-SRTP) — no video passes through SDC servers.</p>
            </CardContent>
          </Card>
        </div>
      </div>
  </div>
  );
}
