/**
 * VideoTile component
 * Displays a WebRTC video stream with status overlay
 */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Video, VideoOff, Wifi, WifiOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  className?: string;
  isConnected?: boolean;
  riskLevel?: "low" | "medium" | "high" | "critical";
  incidentCount?: number;
}

export function VideoTile({
  stream,
  label,
  muted = false,
  className,
  isConnected = false,
  riskLevel,
  incidentCount = 0,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const riskColors: Record<string, string> = {
    low: "border-green-500/60",
    medium: "border-yellow-500/60",
    high: "border-orange-500/60",
    critical: "border-red-500 animate-pulse",
  };

  const riskBadgeColors: Record<string, string> = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    critical: "bg-red-500/20 text-red-400",
  };

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-slate-900 border-2",
        riskLevel ? riskColors[riskLevel] : "border-white/10",
        className
      )}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 min-h-[160px]">
          <VideoOff className="w-10 h-10 text-slate-600" />
          <span className="text-slate-500 text-sm">
            {isConnected ? "No video" : "Waiting for connection..."}
          </span>
        </div>
      )}

      {/* Bottom label bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="text-white text-xs font-medium truncate max-w-[120px]">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {riskLevel && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium capitalize", riskBadgeColors[riskLevel])}>
              {riskLevel}
            </span>
          )}
          {incidentCount > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium">
              {incidentCount} flags
            </span>
          )}
        </div>
      </div>

      {/* Live indicator */}
      {isConnected && stream && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 px-2 py-0.5 rounded text-white text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
}
