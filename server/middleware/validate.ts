import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Generic Zod validation middleware.
 * Validates request body, query params, and/or route params.
 *
 * Usage:
 *   router.post('/ebooks', validate({ body: createEbookSchema }), handler)
 */
export function validate(schemas: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        error: "Validation Error",
        details: errors,
      });
      return;
    }

    next();
  };
}

// ============================================================
// Shared Zod Schemas
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});
