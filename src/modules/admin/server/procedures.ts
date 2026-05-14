import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, or, lt, desc, getTableColumns, sql, count, sum } from "drizzle-orm";

import { db } from "@/db";
import { users, videos, comments, posts, videoViews } from "@/db/schema";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async () => {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [videoCount] = await db.select({ count: count() }).from(videos);
    const [commentCount] = await db.select({ count: count() }).from(comments);
    const [postCount] = await db.select({ count: count() }).from(posts);
    
    // Total watch time (sum of progress in videoViews)
    const [totalWatchTime] = await db.select({ total: sql<number>`CAST(SUM(${videoViews.progress}) AS INTEGER)` }).from(videoViews);

    // Placeholder for DAU/MAU logic (would require a dedicated activity log table for accuracy)
    // For now we can estimate based on users created in the last 24h/30d
    const [dau] = await db.select({ count: count() }).from(users).where(sql`created_at > now() - interval '1 day'`);
    const [mau] = await db.select({ count: count() }).from(users).where(sql`created_at > now() - interval '30 days'`);

    return {
      totalUsers: userCount.count,
      totalVideos: videoCount.count,
      totalComments: commentCount.count,
      totalPosts: postCount.count,
      totalWatchTime: totalWatchTime.total || 0,
      dau: dau.count,
      mau: mau.count,
    };
  }),

  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.object({ id: z.string().uuid(), createdAt: z.date() }).nullish(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, search } = input;

      const data = await db
        .select()
        .from(users)
        .where(
          and(
            search ? or(ilike(users.name, `%${search}%`), ilike(users.handle, `%${search}%`)) : undefined,
            cursor
              ? or(
                  lt(users.createdAt, cursor.createdAt),
                  and(eq(users.createdAt, cursor.createdAt), lt(users.id, cursor.id))
                )
              : undefined
          )
        )
        .orderBy(desc(users.createdAt), desc(users.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? { id: lastItem.id, createdAt: lastItem.createdAt } : null;

      return { items, nextCursor };
    }),

  updateUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        banned: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedUser] = await db
        .update(users)
        .set({ banned: input.banned, updatedAt: new Date() })
        .where(eq(users.id, input.userId))
        .returning();

      if (!updatedUser) throw new TRPCError({ code: "NOT_FOUND" });

      return updatedUser;
    }),
});

// Helper for ilike (not exported by default in some drizzle versions)
function ilike(column: any, value: string) {
  return sql`${column} ILIKE ${value}`;
}
