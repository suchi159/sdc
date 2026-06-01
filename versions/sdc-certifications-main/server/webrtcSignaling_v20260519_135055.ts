/**
 * WebRTC Signaling Server
 * Handles offer/answer/ICE candidate exchange between proctor and candidate
 * Uses WebSocket for real-time signaling
 */
import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface SignalingMessage {
  type: "join" | "offer" | "answer" | "ice-candidate" | "leave" | "ping";
  sessionId: string;
  role: "proctor" | "candidate";
  payload?: any;
}

interface SessionPeer {
  ws: WebSocket;
  role: "proctor" | "candidate";
  sessionId: string;
}

// Map of sessionId → connected peers
const sessions = new Map<string, SessionPeer[]>();

function broadcastToSession(sessionId: string, message: any, excludeWs?: WebSocket) {
  const peers = sessions.get(sessionId) || [];
  const data = JSON.stringify(message);
  for (const peer of peers) {
    if (peer.ws !== excludeWs && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(data);
    }
  }
}

function removePeer(ws: WebSocket) {
  for (const [sessionId, peers] of Array.from(sessions.entries())) {
    const idx = peers.findIndex((p: SessionPeer) => p.ws === ws);
    if (idx !== -1) {
      const removed = peers[idx];
      peers.splice(idx, 1);
      if (peers.length === 0) {
        sessions.delete(sessionId);
      } else {
        broadcastToSession(sessionId, {
          type: "peer-left",
          role: removed.role,
          sessionId,
        });
      }
      break;
    }
  }
}

export function setupWebRTCSignaling(server: Server) {
  // Use noServer:true instead of { server, path } to avoid intercepting ALL upgrade
  // events. When ws uses { server, path }, it calls abortHandshake(socket, 400) for
  // any path that doesn't match, destroying the socket before Vite HMR can handle it.
  // With noServer:true we manually route upgrades by path, leaving all other paths
  // (including Vite HMR) untouched so they can be handled by their own listeners.
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const pathname = (req.url ?? "").split("?")[0];
    if (pathname === "/ws/webrtc") {
      wss.handleUpgrade(req, socket as any, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
    // All other paths (e.g. Vite HMR at /__vite_hmr) are left for other listeners
  });

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (raw: Buffer) => {
      let msg: SignalingMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      const { type, sessionId, role, payload } = msg;

      if (type === "join") {
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, []);
        }
        const peers = sessions.get(sessionId)!;
        // Remove existing connection for same role
        const existingIdx = peers.findIndex(p => p.role === role);
        if (existingIdx !== -1) {
          peers.splice(existingIdx, 1);
        }
        peers.push({ ws, role, sessionId });

        // Notify other peers that someone joined
        broadcastToSession(sessionId, { type: "peer-joined", role, sessionId }, ws);

        // Send current peer list to the new joiner
        const otherRoles = peers.filter(p => p.ws !== ws).map(p => p.role);
        ws.send(JSON.stringify({ type: "session-info", sessionId, peers: otherRoles }));
        return;
      }

      if (type === "leave") {
        removePeer(ws);
        return;
      }

      // Forward offer, answer, ice-candidate to the other peer
      if (["offer", "answer", "ice-candidate"].includes(type)) {
        broadcastToSession(sessionId, { type, role, payload, sessionId }, ws);
        return;
      }
    });

    ws.on("close", () => {
      removePeer(ws);
    });

    ws.on("error", () => {
      removePeer(ws);
    });
  });

  console.log("[WebRTC] Signaling server attached at /ws/webrtc");
  return wss;
}

// REST endpoint to get active session count
export function getActiveSessionCount(): number {
  return sessions.size;
}

export function getSessionPeerCount(sessionId: string): number {
  return (sessions.get(sessionId) || []).length;
}
