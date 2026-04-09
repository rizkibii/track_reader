import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, readingSessions } from "../db/schema.js";

export class UserService {
  /**
   * Get a user by their ID.
   */
  async getUserById(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user ?? null;
  }

  /**
   * Update user profile fields.
   */
  async updateProfile(
    id: string,
    data: {
      username?: string;
      name?: string;
      gender?: string;
      bio?: string;
      image?: string;
    }
  ) {
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Complete user profile: update fields and set profileCompleted flag.
   */
  async completeProfile(
    id: string,
    data: {
      username?: string;
      name?: string;
      gender?: string;
      bio?: string;
      image?: string;
    }
  ) {
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Get aggregated reading stats for a user.
   * Returns: totalBooksRead, totalReadingTimeSeconds, currentStreak
   */
  async getUserStats(userId: string) {
    // Total distinct books read (completed sessions)
    const booksResult = await db
      .select({
        count: sql<number>`count(DISTINCT ${readingSessions.ebookId})`.as(
          "count"
        ),
      })
      .from(readingSessions)
      .where(eq(readingSessions.userId, userId));

    // Total reading time
    const timeResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${readingSessions.durationSeconds}), 0)`.as(
          "total"
        ),
      })
      .from(readingSessions)
      .where(eq(readingSessions.userId, userId));

    // Reading streak: count consecutive days with reading sessions ending from today
    const streakResult = await db.execute(sql`
      WITH daily_reads AS (
        SELECT DISTINCT DATE(${readingSessions.startedAt}) AS read_date
        FROM ${readingSessions}
        WHERE ${readingSessions.userId} = ${userId}
        ORDER BY read_date DESC
      ),
      streaks AS (
        SELECT 
          read_date,
          read_date - (ROW_NUMBER() OVER (ORDER BY read_date DESC))::int AS grp
        FROM daily_reads
      )
      SELECT COUNT(*) AS streak
      FROM streaks
      WHERE grp = (SELECT grp FROM streaks LIMIT 1)
    `);

    return {
      totalBooksRead: Number(booksResult[0]?.count ?? 0),
      totalReadingTimeSeconds: Number(timeResult[0]?.total ?? 0),
      currentStreak: Number(
        (streakResult as unknown as Array<{ streak: number }>)[0]?.streak ?? 0
      ),
    };
  }
}

export const userService = new UserService();
