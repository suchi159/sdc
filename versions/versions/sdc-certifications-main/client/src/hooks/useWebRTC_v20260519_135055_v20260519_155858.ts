/**
 * useWebRTC hook
 * Manages WebRTC peer connection and signaling via WebSocket
 * Used by both candidate (sender) and proctor (receiver)
 */
import { useEffect, useRef, useState, useCallback } from "react";

type Role = "proctor" | "candidate";

interface UseWebRTCOptions {
  sessionId: string | number;
  role: Role;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC({ sessionId, role, onRemoteStream, onConnectionStateChange }: UseWebRTCOptions) {
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalingState, setSignalingState] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const getWsUrl = () => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/ws/webrtc`;
  };

  const sendSignal = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({
          type: "ice-candidate",
          sessionId: String(sessionId),
          role,
          payload: e.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      setRemoteStream(stream);
      onRemoteStream?.(stream);
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      setIsConnected(pc.connectionState === "connected");
      onConnectionStateChange?.(pc.connectionState);
    };

    pcRef.current = pc;
    return pc;
  }, [sessionId, role, sendSignal, onRemoteStream, onConnectionStateChange]);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError("Camera/microphone access denied");
      throw err;
    }
  }, []);

  const connect = useCallback(async () => {
    setSignalingState("connecting");
    setError(null);

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setSignalingState("connected");
      sendSignal({ type: "join", sessionId: String(sessionId), role });
    };

    ws.onclose = () => {
      setSignalingState("disconnected");
      setIsConnected(false);
    };

    ws.onerror = () => {
      setError("WebSocket connection failed");
      setSignalingState("disconnected");
    };

    ws.onmessage = async (event) => {
      let msg: any;
      try { msg = JSON.parse(event.data); } catch { return; }

      if (msg.type === "session-info") {
        // If there's already a candidate peer, initiate offer (if we're the candidate)
        if (role === "candidate" && msg.peers.includes("proctor")) {
          await initiateCall();
        }
        return;
      }

      if (msg.type === "peer-joined") {
        // If proctor joined and we're the candidate, initiate the call
        if (role === "candidate" && msg.role === "proctor") {
          await initiateCall();
        }
        return;
      }

      if (msg.type === "offer" && role === "proctor") {
        const pc = pcRef.current || createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
        // Drain pending ICE candidates
        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidates.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "answer", sessionId: String(sessionId), role, payload: answer });
        return;
      }

      if (msg.type === "answer" && role === "candidate") {
        const pc = pcRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          for (const c of pendingCandidates.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];
        }
        return;
      }

      if (msg.type === "ice-candidate") {
        const pc = pcRef.current;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
        } else {
          pendingCandidates.current.push(msg.payload);
        }
        return;
      }
    };
  }, [sessionId, role, sendSignal, createPeerConnection]);

  const initiateCall = useCallback(async () => {
    const pc = createPeerConnection();
    const stream = localStreamRef.current || await startLocalStream();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: "offer", sessionId: String(sessionId), role, payload: offer });
  }, [createPeerConnection, startLocalStream, sendSignal, sessionId, role]);

  const disconnect = useCallback(() => {
    sendSignal({ type: "leave", sessionId: String(sessionId), role });
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setConnectionState("closed");
    setSignalingState("disconnected");
  }, [sessionId, role, sendSignal]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    connectionState,
    localStream,
    remoteStream,
    isConnected,
    error,
    signalingState,
    connect,
    disconnect,
    startLocalStream,
  };
}
