import { eq, ilike, sql, and, desc, asc, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { ebooks, readingSessions, type NewEbook } from "../db/schema.js";

export class EbookService {
  /**
   * List published ebooks with optional search, pagination.
   * Optionally includes read-status per user.
   */
  async listEbooks(options: {
    search?: string;
    page: number;
    limit: number;
    userId?: string;
  }) {
    const { search, page, limit } = options;
    const offset = (page - 1) * limit;

    const conditions = [eq(ebooks.isPublished, true)];

    if (search) {
      conditions.push(
        sql`(${ilike(ebooks.title, `%${search}%`)} OR ${ilike(
          ebooks.description,
          `%${search}%`
        )})`
      );
    }

    const where = and(...conditions);

    const [items, countResult] = await Promise.all([
      db.query.ebooks.findMany({
        where,
        limit,
        offset,
        orderBy: [desc(ebooks.createdAt)],
      }),
      db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(ebooks)
        .where(where),
    ]);

    // If userId provided, attach read status and total reading time per ebook
    let enrichedItems = items;
    if (options.userId && items.length > 0) {
      const ebookIds = items.map((e) => e.id);
      const readStats = await db
        .select({
          ebookId: readingSessions.ebookId,
          totalDuration:
            sql<number>`COALESCE(SUM(${readingSessions.durationSeconds}), 0)`.as(
              "total_duration"
            ),
        })
        .from(readingSessions)
        .where(
          and(
            eq(readingSessions.userId, options.userId),
            inArray(readingSessions.ebookId, ebookIds)
          )
        )
        .groupBy(readingSessions.ebookId);

      const statsMap = new Map(readStats.map((s) => [s.ebookId, s]));

      enrichedItems = items.map((item) => {
        const stats = statsMap.get(item.id);
        return {
          ...item,
          totalReadDuration: Number(stats?.totalDuration ?? 0),
          hasRead: !!stats,
        };
      });
    }

    return {
      data: enrichedItems,
      pagination: {
        page,
        limit,
        total: Number(countResult[0]?.count ?? 0),
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  }

  /**
   * Get a single ebook by ID.
   */
  async getEbookById(id: string) {
    const ebook = await db.query.ebooks.findFirst({
      where: eq(ebooks.id, id),
    });
    return ebook ?? null;
  }

  /**
   * Create a new ebook.
   */
  async createEbook(data: Omit<NewEbook, "id" | "createdAt" | "updatedAt">) {
    const [created] = await db.insert(ebooks).values(data).returning();
    return created;
  }

  /**
   * Update an existing ebook.
   */
  async updateEbook(
    id: string,
    data: Partial<Omit<NewEbook, "id" | "createdAt" | "updatedAt">>
  ) {
    const [updated] = await db
      .update(ebooks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ebooks.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete an ebook.
   */
  async deleteEbook(id: string) {
    const [deleted] = await db
      .delete(ebooks)
      .where(eq(ebooks.id, id))
      .returning();
    return deleted;
  }

  /**
   * Get reader count (active + total) for an ebook.
   */
  async getReaderCount(ebookId: string) {
    const [activeResult, totalResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(DISTINCT ${readingSessions.userId})`.as("count") })
        .from(readingSessions)
        .where(
          and(
            eq(readingSessions.ebookId, ebookId),
            eq(readingSessions.isActive, true)
          )
        ),
      db
        .select({ count: sql<number>`count(DISTINCT ${readingSessions.userId})`.as("count") })
        .from(readingSessions)
        .where(eq(readingSessions.ebookId, ebookId)),
    ]);

    return {
      activeReaders: Number(activeResult[0]?.count ?? 0),
      totalReaders: Number(totalResult[0]?.count ?? 0),
    };
  }

  /**
   * List all ebooks for admin (includes unpublished, pagination).
   */
  async listAllEbooks(options: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const { search, page, limit } = options;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        sql`(${ilike(ebooks.title, `%${search}%`)} OR ${ilike(
          ebooks.description,
          `%${search}%`
        )})`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db.query.ebooks.findMany({
        where,
        limit,
        offset,
        orderBy: [desc(ebooks.createdAt)],
      }),
      db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(ebooks)
        .where(where),
    ]);

    // Attach reader counts per ebook
    const ebookIds = items.map((e) => e.id);
    let readerCounts: Array<{ ebookId: string; count: number }> = [];
    if (ebookIds.length > 0) {
      readerCounts = await db
        .select({
          ebookId: readingSessions.ebookId,
          count:
            sql<number>`count(DISTINCT ${readingSessions.userId})`.as("count"),
        })
        .from(readingSessions)
        .where(inArray(readingSessions.ebookId, ebookIds))
        .groupBy(readingSessions.ebookId);
    }

    const countsMap = new Map(
      readerCounts.map((r) => [r.ebookId, Number(r.count)])
    );

    const enrichedItems = items.map((item) => ({
      ...item,
      readerCount: countsMap.get(item.id) ?? 0,
    }));

    return {
      data: enrichedItems,
      pagination: {
        page,
        limit,
        total: Number(countResult[0]?.count ?? 0),
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  }
}

export const ebookService = new EbookService();
