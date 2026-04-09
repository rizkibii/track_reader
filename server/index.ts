import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import ebookRoutes from "./routes/ebook.routes.js";
import readingSessionRoutes from "./routes/reading-session.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { readingSessionService } from "./services/reading-session.service.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Global Middleware
// ============================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Routes
// ============================================================

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Better Auth — handles all OAuth flows
app.use("/api/auth", authRoutes);

// Application routes
app.use("/api/users", userRoutes);
app.use("/api/ebooks", ebookRoutes);
app.use("/api/reading-sessions", readingSessionRoutes);
app.use("/api/admin", adminRoutes);

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ============================================================
// 404 Handler for APIs (Only for /api/* routes)
// ============================================================

app.use("/api/*", (_req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource does not exist.",
  });
});

// ============================================================
// Static Frontend Serving (For Production)
// ============================================================

// Resolve the path to the frontend dist folder from either 'server/dist/' or 'server/'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist"); // when running from server/dist
const fallbackDistPath = path.resolve(__dirname, "../dist"); // when running from server/ directly

const servePath = fs.existsSync(distPath) ? distPath : fallbackDistPath;

app.use(express.static(servePath));

// For React Router HTML History API Fallback
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(path.join(servePath, "index.html"));
});

// ============================================================
// Global Error Handler
// ============================================================

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred."
          : err.message,
    });
  }
);

// ============================================================
// Startup (Except for Serverless)
// ============================================================

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 TrackReader API server running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);

    // Cleanup stale reading sessions on startup
    readingSessionService.cleanupStaleSessions().then((count) => {
      if (count > 0) {
        console.log(`🧹 Cleaned up ${count} stale reading sessions`);
      }
    });

    // Periodically cleanup stale sessions (every 5 minutes)
    setInterval(async () => {
      try {
        const count = await readingSessionService.cleanupStaleSessions();
        if (count > 0) {
          console.log(`🧹 Cleaned up ${count} stale reading sessions`);
        }
      } catch (error) {
        console.error("Error cleaning up stale sessions:", error);
      }
    }, 5 * 60 * 1000);
  });
}

export default app;
