import { eq, and, desc, asc, sql, ilike, or, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, ebooks, readingSessions } from "../db/schema.js";

export class AdminService {
  /**
   * Get aggregated dashboard statistics.
   */
  async getDashboardStats() {
    const [totalReadersResult, avgDurationResult, activeSessionsResult, totalEbooksResult] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(users)
          .where(eq(users.role, "user")),
        db
          .select({
            avg: sql<number>`COALESCE(AVG(${readingSessions.durationSeconds}), 0)`.as("avg"),
          })
          .from(readingSessions),
        db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(readingSessions)
          .where(eq(readingSessions.isActive, true)),
        db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(ebooks),
      ]);

    return {
      totalReaders: Number(totalReadersResult[0]?.count ?? 0),
      avgDurationSeconds: Math.round(Number(avgDurationResult[0]?.avg ?? 0)),
      activeSessions: Number(activeSessionsResult[0]?.count ?? 0),
      totalEbooks: Number(totalEbooksResult[0]?.count ?? 0),
    };
  }

  /**
   * Get daily reader count for chart data.
   * Returns data for the last 7 days (or a custom offset).
   */
  async getDailyReadersChart(daysBack: number = 7) {
    const result = await db.execute(sql`
      SELECT
        DATE(${readingSessions.startedAt}) AS day,
        COUNT(DISTINCT ${readingSessions.userId}) AS count
      FROM ${readingSessions}
      WHERE ${readingSessions.startedAt} >= NOW() - INTERVAL '${sql.raw(String(daysBack))} days'
      GROUP BY DATE(${readingSessions.startedAt})
      ORDER BY day ASC
    `);

    return result as unknown as Array<{ day: string; count: number }>;
  }

  /**
   * Get most popular ebooks by total reader count.
   */
  async getPopularEbooks(limit: number = 5) {
    const result = await db
      .select({
        ebookId: readingSessions.ebookId,
        readerCount:
          sql<number>`count(DISTINCT ${readingSessions.userId})`.as(
            "reader_count"
          ),
      })
      .from(readingSessions)
      .groupBy(readingSessions.ebookId)
      .orderBy(sql`reader_count DESC`)
      .limit(limit);

    // Enrich with ebook details
    if (result.length === 0) return [];

    const ebookIds = result.map((r) => r.ebookId);
    const ebookList = await db.query.ebooks.findMany({
      where: sql`${ebooks.id} = ANY(${ebookIds})`,
    });

    const ebookMap = new Map(ebookList.map((e) => [e.id, e]));

    return result.map((r) => ({
      ebook: ebookMap.get(r.ebookId) ?? null,
      readerCount: Number(r.readerCount),
    }));
  }

  /**
   * Get currently active reading sessions with user and ebook info.
   * Used for the real-time monitoring table.
   */
  async getRealtimeSessions() {
    const sessions = await db.query.readingSessions.findMany({
      where: eq(readingSessions.isActive, true),
      with: {
        user: true,
        ebook: true,
      },
      orderBy: [desc(readingSessions.startedAt)],
    });

    if (sessions.length === 0) return [];

    // Calculate total duration for this user and ebook across ALL their sessions
    const userIds = sessions.map(s => s.userId);
    const ebookIds = sessions.map(s => s.ebookId);
    
    const totalDurations = await db
      .select({
        userId: readingSessions.userId,
        ebookId: readingSessions.ebookId,
        total: sql<number>`SUM(${readingSessions.durationSeconds})`.as("total")
      })
      .from(readingSessions)
      .where(
        and(
          inArray(readingSessions.userId, userIds),
          inArray(readingSessions.ebookId, ebookIds)
        )
      )
      .groupBy(readingSessions.userId, readingSessions.ebookId);

    const durationMap = new Map();
    for (const row of totalDurations) {
      durationMap.set(`${row.userId}-${row.ebookId}`, Number(row.total));
    }

    return sessions.map((s) => ({
      id: s.id,
      user: {
        id: s.user.id,
        name: s.user.name,
        image: s.user.image,
      },
      ebook: {
        id: s.ebook.id,
        title: s.ebook.title,
      },
      durationSeconds: durationMap.get(`${s.user.id}-${s.ebook.id}`) || s.durationSeconds,
      startedAt: s.startedAt,
    }));
  }

  /**
   * List all users with search, filter, and pagination.
   */
  async listUsers(options: {
    search?: string;
    role?: string;
    page: number;
    limit: number;
  }) {
    const { search, role, page, limit } = options;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db.query.users.findMany({
        where,
        limit,
        offset,
        orderBy: [desc(users.createdAt)],
      }),
      db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(users)
        .where(where),
    ]);

    // Strip sensitive fields
    const safeItems = items.map(({ ...user }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      username: user.username,
      gender: user.gender,
      role: user.role,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
    }));

    return {
      data: safeItems,
      pagination: {
        page,
        limit,
        total: Number(countResult[0]?.count ?? 0),
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  }

  /**
   * Update a user's role.
   */
  async updateUserRole(userId: string, role: string) {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  /**
   * Delete a user.
   */
  async deleteUser(userId: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    return deleted;
  }

  /**
   * Get user-related aggregate stats for the admin panel.
   */
  async getUserStats() {
    const [totalResult, activeResult, adminResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(users),
      db
        .select({
          count: sql<number>`count(DISTINCT ${readingSessions.userId})`.as("count"),
        })
        .from(readingSessions)
        .where(eq(readingSessions.isActive, true)),
      db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(users)
        .where(eq(users.role, "admin")),
    ]);

    return {
      totalUsers: Number(totalResult[0]?.count ?? 0),
      activeNow: Number(activeResult[0]?.count ?? 0),
      adminCount: Number(adminResult[0]?.count ?? 0),
    };
  }
}

export const adminService = new AdminService();
