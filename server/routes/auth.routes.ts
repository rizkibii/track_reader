import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth/index.js";

const router = Router();

/**
 * Mount all Better Auth routes at /api/auth/*
 * This handles: sign-in, sign-out, callback, session, etc.
 */
router.all("/*splat", toNodeHandler(auth));

export default router;
