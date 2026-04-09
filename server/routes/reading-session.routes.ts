import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate, paginationSchema } from "../middleware/validate.js";
import { readingSessionService } from "../services/reading-session.service.js";

const router = Router();

// All reading session routes require authentication
router.use(requireAuth);

// ============================================================
// Validation Schemas
// ============================================================

const startSessionSchema = z.object({
  ebookId: z.string().uuid("Invalid ebook ID"),
});

const heartbeatSchema = z.object({
  durationSeconds: z.number().int().min(0),
});

const sessionIdParamSchema = z.object({
  id: z.string().uuid("Invalid session ID"),
});

const historyQuerySchema = paginationSchema.extend({
  sort: z.enum(["latest", "oldest", "longest"]).default("latest"),
});

// ============================================================
// Routes
// ============================================================

/**
 * POST /api/reading-sessions/start
 * Start a new reading session for a specific ebook.
 */
router.post(
  "/start",
  validate({ body: startSessionSchema }),
  async (req, res) => {
    try {
      const session = await readingSessionService.startSession(
        req.user!.id,
        req.body.ebookId
      );
      res.status(201).json({ data: session });
    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/reading-sessions/:id/heartbeat
 * Send a heartbeat to update the duration of an active session.
 */
router.patch(
  "/:id/heartbeat",
  validate({ params: sessionIdParamSchema, body: heartbeatSchema }),
  async (req, res) => {
    try {
      const updated = await readingSessionService.heartbeat(
        req.params.id as string,
        req.body.durationSeconds
      );
      if (!updated) {
        res.status(404).json({ error: "Active session not found" });
        return;
      }
      res.json({ data: updated });
    } catch (error) {
      console.error("Error processing heartbeat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/reading-sessions/:id/end
 * End a reading session.
 */
router.patch(
  "/:id/end",
  validate({ params: sessionIdParamSchema }),
  async (req, res) => {
    try {
      const ended = await readingSessionService.endSession(req.params.id as string);
      if (!ended) {
        res.status(404).json({ error: "Active session not found" });
        return;
      }
      res.json({ data: ended });
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/reading-sessions/active
 * Get the user's currently active reading session.
 */
router.get("/active", async (req, res) => {
  try {
    const session = await readingSessionService.getActiveSession(req.user!.id);
    res.json({ data: session });
  } catch (error) {
    console.error("Error getting active session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/reading-sessions/history
 * Get the user's reading history with sorting & pagination.
 */
router.get(
  "/history",
  validate({ query: historyQuerySchema }),
  async (req, res) => {
    try {
      const { sort, page, limit } = req.query as any;
      const result = await readingSessionService.getUserHistory(req.user!.id, {
        sort: sort || "latest",
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
      res.json(result);
    } catch (error) {
      console.error("Error getting history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
