import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { userService } from "../services/user.service.js";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// ============================================================
// Validation Schemas
// ============================================================

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  name: z.string().min(1).max(100).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

const completeProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  name: z.string().min(1).max(100).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

// ============================================================
// Routes
// ============================================================

/**
 * GET /api/users/me
 * Get current authenticated user's profile.
 */
router.get("/me", async (req, res) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: user });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/users/me
 * Update current user's profile.
 */
router.patch(
  "/me",
  validate({ body: updateProfileSchema }),
  async (req, res) => {
    try {
      const updated = await userService.updateProfile(req.user!.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ data: updated });
    } catch (error: any) {
      // Handle unique constraint violation on username
      if (error?.code === "23505" && error?.constraint?.includes("username")) {
        res.status(409).json({ error: "Username already taken" });
        return;
      }
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/users/me/complete-profile
 * Complete user profile setup (step after first login).
 */
router.post(
  "/me/complete-profile",
  validate({ body: completeProfileSchema }),
  async (req, res) => {
    try {
      const updated = await userService.completeProfile(req.user!.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ data: updated });
    } catch (error: any) {
      if (error?.code === "23505" && error?.constraint?.includes("username")) {
        res.status(409).json({ error: "Username already taken" });
        return;
      }
      console.error("Error completing profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/users/me/stats
 * Get reading stats for the current user.
 */
router.get("/me/stats", async (req, res) => {
  try {
    const stats = await userService.getUserStats(req.user!.id);
    res.json({ data: stats });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
