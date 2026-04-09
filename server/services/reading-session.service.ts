import { eq, and, desc, asc, sql, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { readingSessions, ebooks } from "../db/schema.js";

// Stale session threshold: 5 minutes without heartbeat
const STALE_SESSION_THRESHOLD_MS = 5 * 60 * 1000;

export class ReadingSessionService {
  /**
   * Start a new reading session for a user on a specific ebook.
   * Automatically ends any existing active session.
   */
  async startSession(userId: string, ebookId: string) {
    // End any existing active session first
    await this.endAllActiveSessions(userId);

    const [session] = await db
      .insert(readingSessions)
      .values({
        userId,
        ebookId,
        durationSeconds: 0,
        isActive: true,
        startedAt: new Date(),
      })
      .returning();

    return session;
  }

  /**
   * Heartbeat: update the duration of an active session.
   * Called periodically by the frontend (e.g., every 30 seconds).
   */
  async heartbeat(sessionId: string, durationSeconds: number) {
    const [updated] = await db
      .update(readingSessions)
      .set({
        durationSeconds,
      })
      .where(
        and(
          eq(readingSessions.id, sessionId),
          eq(readingSessions.isActive, true)
        )
      )
      .returning();

    return updated ?? null;
  }

  /**
   * End a reading session.
   */
  async endSession(sessionId: string) {
    const [updated] = await db
      .update(readingSessions)
      .set({
        isActive: false,
        endedAt: new Date(),
      })
      .where(
        and(
          eq(readingSessions.id, sessionId),
          eq(readingSessions.isActive, true)
        )
      )
      .returning();

    return updated ?? null;
  }

  /**
   * Get the user's currently active reading session (if any).
   */
  async getActiveSession(userId: string) {
    const session = await db.query.readingSessions.findFirst({
      where: and(
        eq(readingSessions.userId, userId),
        eq(readingSessions.isActive, true)
      ),
      with: {
        ebook: true,
      },
    });

    return session ?? null;
  }

  /**
   * Get paginated reading history for a user.
   */
  async getUserHistory(
    userId: string,
    options: {
      sort: "latest" | "oldest" | "longest";
      page: number;
      limit: number;
    }
  ) {
    const { sort, page, limit } = options;
    const offset = (page - 1) * limit;

    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = [asc(readingSessions.startedAt)];
        break;
      case "longest":
        orderBy = [desc(readingSessions.durationSeconds)];
        break;
      case "latest":
      default:
        orderBy = [desc(readingSessions.startedAt)];
    }

    const where = and(
      eq(readingSessions.userId, userId),
      eq(readingSessions.isActive, false)
    );

    const [items, countResult] = await Promise.all([
      db.query.readingSessions.findMany({
        where,
        with: {
          ebook: true,
        },
        limit,
        offset,
        orderBy,
      }),
      db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(readingSessions)
        .where(where),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total: Number(countResult[0]?.count ?? 0),
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  }

  /**
   * End all active sessions for a user (cleanup before starting a new one).
   */
  private async endAllActiveSessions(userId: string) {
    await db
      .update(readingSessions)
      .set({
        isActive: false,
        endedAt: new Date(),
      })
      .where(
        and(
          eq(readingSessions.userId, userId),
          eq(readingSessions.isActive, true)
        )
      );
  }

  /**
   * Cleanup stale sessions that haven't had a heartbeat in 5 minutes.
   * Can be called on a cron schedule or on app startup.
   */
  async cleanupStaleSessions() {
    const threshold = new Date(Date.now() - STALE_SESSION_THRESHOLD_MS);

    const stale = await db
      .update(readingSessions)
      .set({
        isActive: false,
        endedAt: new Date(),
      })
      .where(
        and(
          eq(readingSessions.isActive, true),
          lt(readingSessions.createdAt, threshold)
        )
      )
      .returning();

    return stale.length;
  }
}

export const readingSessionService = new ReadingSessionService();
