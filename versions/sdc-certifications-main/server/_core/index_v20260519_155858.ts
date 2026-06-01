import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { setupWebRTCSignaling } from "../webrtcSignaling";
import { registerStripeWebhook } from "../stripeWebhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import apiV1Router from "../api/routes";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Rate limiters
// Public tRPC: 120 req/min per IP (generous for normal browsing, blocks scrapers)
const trpcPublicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: { error: "Too many requests. Please slow down." },
});

// REST API v1: 300 req/min per API key (or IP fallback)
const apiV1Limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false, keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7, 47); // first 40 chars of key
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  message: { error: "API rate limit exceeded. Reduce request frequency." },
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Trust reverse proxy (Nginx/Cloudflare) so req.protocol reflects HTTPS correctly
  // This is required for SameSite=None; Secure cookies to work behind a proxy
  app.set("trust proxy", 1);
  // Stripe webhook MUST be registered before express.json() to get raw body for signature verification
  registerStripeWebhook(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Health check endpoint (required by Render and other PaaS platforms)
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Public REST API v1 (API key Bearer auth — for LMS/HR integrations)
  app.use("/api/v1", apiV1Limiter, apiV1Router);
  // tRPC API
  app.use(
    "/api/trpc",
    trpcPublicLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // WebRTC signaling server (WebSocket at /ws/webrtc)
  setupWebRTCSignaling(server);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Bind to 0.0.0.0 so Render/Docker can route traffic to the container
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
