import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate, paginationSchema, uuidParamSchema } from "../middleware/validate.js";
import { ebookService } from "../services/ebook.service.js";

const router = Router();

// All ebook routes require authentication
router.use(requireAuth);

// ============================================================
// Validation Schemas
// ============================================================

const listEbooksQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

const createEbookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  coverImageUrl: z.string().url("Invalid cover image URL").optional(),
  heyzineUrl: z.string().url("Invalid Heyzine URL"),
  category: z.string().max(100).optional(),
  author: z.string().max(200).optional(),
  isPublished: z.boolean().optional(),
});

const updateEbookSchema = createEbookSchema.partial();

// ============================================================
// User-Facing Routes
// ============================================================

/**
 * GET /api/ebooks
 * List all published ebooks with search & pagination.
 */
router.get(
  "/",
  validate({ query: listEbooksQuerySchema }),
  async (req, res) => {
    try {
      const { search, page, limit } = req.query as any;
      const result = await ebookService.listEbooks({
        search,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        userId: req.user!.id,
      });
      res.json(result);
    } catch (error) {
      console.error("Error listing ebooks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/ebooks/:id
 * Get a single ebook by ID.
 */
router.get(
  "/:id",
  validate({ params: uuidParamSchema }),
  async (req, res) => {
    try {
      const ebook = await ebookService.getEbookById(req.params.id as string);
      if (!ebook) {
        res.status(404).json({ error: "Ebook not found" });
        return;
      }
      res.json({ data: ebook });
    } catch (error) {
      console.error("Error getting ebook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/ebooks/:id/reader-count
 * Get active and total reader counts for an ebook.
 */
router.get(
  "/:id/reader-count",
  validate({ params: uuidParamSchema }),
  async (req, res) => {
    try {
      const counts = await ebookService.getReaderCount(req.params.id as string);
      res.json({ data: counts });
    } catch (error) {
      console.error("Error getting reader count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ============================================================
// Admin-Only Routes
// ============================================================

/**
 * POST /api/ebooks
 * Create a new ebook (admin only).
 */
router.post(
  "/",
  requireAdmin,
  validate({ body: createEbookSchema }),
  async (req, res) => {
    try {
      const ebook = await ebookService.createEbook(req.body);
      res.status(201).json({ data: ebook });
    } catch (error) {
      console.error("Error creating ebook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/ebooks/:id
 * Update an ebook (admin only).
 */
router.patch(
  "/:id",
  requireAdmin,
  validate({ params: uuidParamSchema, body: updateEbookSchema }),
  async (req, res) => {
    try {
      const updated = await ebookService.updateEbook(req.params.id as string, req.body);
      if (!updated) {
        res.status(404).json({ error: "Ebook not found" });
        return;
      }
      res.json({ data: updated });
    } catch (error) {
      console.error("Error updating ebook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/ebooks/:id
 * Delete an ebook (admin only).
 */
router.delete(
  "/:id",
  requireAdmin,
  validate({ params: uuidParamSchema }),
  async (req, res) => {
    try {
      const deleted = await ebookService.deleteEbook(req.params.id as string);
      if (!deleted) {
        res.status(404).json({ error: "Ebook not found" });
        return;
      }
      res.json({ data: deleted, message: "Ebook deleted successfully" });
    } catch (error) {
      console.error("Error deleting ebook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
