import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, or, lt, desc, getTableColumns, sql } from "drizzle-orm";

import { db } from "@/db";
import { reports, users, videos, comments, posts } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";

export const reportsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        targetId: z.string().uuid(),
        targetType: z.enum(["video", "comment", "user", "post"]),
        reason: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [newReport] = await db
        .insert(reports)
        .values({
          userId,
          targetId: input.targetId,
          targetType: input.targetType,
          reason: input.reason,
          description: input.description,
          status: "pending",
        })
        .returning();

      return newReport;
    }),

  getMany: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
        targetType: z.enum(["video", "comment", "user", "post"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.object({ id: z.string().uuid(), createdAt: z.date() }).nullish(),
      })
    )
    .query(async ({ input }) => {
      const { status, targetType, limit, cursor } = input;

      const data = await db
        .select({
          ...getTableColumns(reports),
          user: users,
        })
        .from(reports)
        .innerJoin(users, eq(reports.userId, users.id))
        .where(
          and(
            status ? eq(reports.status, status) : undefined,
            targetType ? eq(reports.targetType, targetType) : undefined,
            cursor
              ? or(
                  lt(reports.createdAt, cursor.createdAt),
                  and(eq(reports.createdAt, cursor.createdAt), lt(reports.id, cursor.id))
                )
              : undefined
          )
        )
        .orderBy(desc(reports.createdAt), desc(reports.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      // Map targets (Video title, comment content, etc.)
      const itemsWithTargets = await Promise.all(
        items.map(async (report) => {
          let targetName = "Unknown";
          if (report.targetType === "video") {
            const [video] = await db.select({ title: videos.title }).from(videos).where(eq(videos.id, report.targetId));
            targetName = video?.title || "Video does not exist";
          } else if (report.targetType === "comment") {
            const [comment] = await db.select({ value: comments.value }).from(comments).where(eq(comments.id, report.targetId));
            targetName = comment?.value || "Comment does not exist";
          } else if (report.targetType === "user") {
            const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, report.targetId));
            targetName = user?.name || "User does not exist";
          } else if (report.targetType === "post") {
            const [post] = await db.select({ title: posts.content }).from(posts).where(eq(posts.id, report.targetId));
            targetName = post?.title || "Post does not exist";
          }
          return { ...report, targetName };
        })
      );

      const lastItem = itemsWithTargets[itemsWithTargets.length - 1];
      const nextCursor = hasMore ? { id: lastItem.id, createdAt: lastItem.createdAt } : null;

      return { items: itemsWithTargets, nextCursor };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["reviewed", "resolved", "dismissed"]),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedReport] = await db
        .update(reports)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(reports.id, input.id))
        .returning();

      if (!updatedReport) throw new TRPCError({ code: "NOT_FOUND" });

      return updatedReport;
    }),

  deleteTarget: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [report] = await db.select().from(reports).where(eq(reports.id, input.id));
      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      if (report.targetType === "video") {
        await db.delete(videos).where(eq(videos.id, report.targetId));
      } else if (report.targetType === "comment") {
        await db.delete(comments).where(eq(comments.id, report.targetId));
      } else if (report.targetType === "user") {
        // Soft delete or block user? For now let's not delete users to avoid major data loss.
        // await db.delete(users).where(eq(users.id, report.targetId));
      } else if (report.targetType === "post") {
        await db.delete(posts).where(eq(posts.id, report.targetId));
      }

      await db.update(reports).set({ status: "resolved", updatedAt: new Date() }).where(eq(reports.id, report.id));

      return { success: true };
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [deletedReport] = await db
        .delete(reports)
        .where(eq(reports.id, input.id))
        .returning();

      if (!deletedReport) throw new TRPCError({ code: "NOT_FOUND" });

      return deletedReport;
    }),
});
