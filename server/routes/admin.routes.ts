import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate, paginationSchema } from "../middleware/validate.js";
import { adminService } from "../services/admin.service.js";
import { ebookService } from "../services/ebook.service.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

// ============================================================
// Validation Schemas
// ============================================================

const listUsersQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["admin", "user"]).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

const userIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

const ebookListQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

// ============================================================
// Dashboard Routes
// ============================================================

/**
 * GET /api/admin/dashboard
 * Aggregated dashboard statistics.
 */
router.get("/dashboard", async (_req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ data: stats });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/dashboard/daily-readers
 * Daily readers chart data.
 */
router.get("/dashboard/daily-readers", async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const data = await adminService.getDailyReadersChart(days);
    res.json({ data });
  } catch (error) {
    console.error("Error getting daily readers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/dashboard/popular-ebooks
 * Top ebooks by reader count.
 */
router.get("/dashboard/popular-ebooks", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const data = await adminService.getPopularEbooks(limit);
    res.json({ data });
  } catch (error) {
    console.error("Error getting popular ebooks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/dashboard/realtime
 * Currently active reading sessions.
 */
router.get("/dashboard/realtime", async (_req, res) => {
  try {
    const data = await adminService.getRealtimeSessions();
    res.json({ data });
  } catch (error) {
    console.error("Error getting realtime sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// User Management Routes
// ============================================================

/**
 * GET /api/admin/users
 * List all users with search, filter, and pagination.
 */
router.get(
  "/users",
  validate({ query: listUsersQuerySchema }),
  async (req, res) => {
    try {
      const { search, role, page, limit } = req.query as any;
      const result = await adminService.listUsers({
        search,
        role,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
      res.json(result);
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/admin/users/:id/role
 * Update a user's role.
 */
router.patch(
  "/users/:id/role",
  validate({ params: userIdParamSchema, body: updateRoleSchema }),
  async (req, res) => {
    try {
      const updated = await adminService.updateUserRole(
        req.params.id as string,
        req.body.role
      );
      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ data: updated });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 * Delete a user.
 */
router.delete(
  "/users/:id",
  validate({ params: userIdParamSchema }),
  async (req, res) => {
    try {
      // Prevent self-deletion
      if ((req.params.id as string) === req.user!.id) {
        res.status(400).json({ error: "Cannot delete your own account" });
        return;
      }

      const deleted = await adminService.deleteUser(req.params.id as string);
      if (!deleted) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ data: deleted, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/admin/stats/users
 * Aggregate user statistics.
 */
router.get("/stats/users", async (_req, res) => {
  try {
    const stats = await adminService.getUserStats();
    res.json({ data: stats });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// Admin Ebook Management
// ============================================================

/**
 * GET /api/admin/ebooks
 * List all ebooks (including unpublished) with reader counts.
 */
router.get(
  "/ebooks",
  validate({ query: ebookListQuerySchema }),
  async (req, res) => {
    try {
      const { search, page, limit } = req.query as any;
      const result = await ebookService.listAllEbooks({
        search,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
      res.json(result);
    } catch (error) {
      console.error("Error listing admin ebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
