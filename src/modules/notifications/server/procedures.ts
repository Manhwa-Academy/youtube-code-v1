import { z } from "zod";
import { db } from "@/db";
import { notifications, users, videos, posts, comments, notificationPreferences, pushSubscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, desc, count, getTableColumns, or, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = createTRPCRouter({
  savePushSubscription: protectedProcedure
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { endpoint, keys } = input;
      const stringifiedKeys = JSON.stringify(keys);

      const [subscription] = await db
        .insert(pushSubscriptions)
        .values({ userId, endpoint, keys: stringifiedKeys })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: { userId, keys: stringifiedKeys, updatedAt: new Date() }
        })
        .returning();

      return subscription;
    }),

  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const { id: userId } = ctx.user;
      
      const existing = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      
      const allTypes = ["video_like", "video_comment", "comment_reply", "comment_like", "subscription", "post_like", "post_comment"] as const;
      
      const fullPreferences = allTypes.map(type => {
        const pref = existing.find(p => p.type === type);
        return {
          type,
          email: pref ? pref.email : true,
          push: pref ? pref.push : true,
          inApp: pref ? pref.inApp : true,
        };
      });
      
      return fullPreferences;
    }),

  updatePreference: protectedProcedure
    .input(z.object({
      type: z.enum(["video_like", "video_comment", "comment_reply", "comment_like", "subscription", "post_like", "post_comment"]),
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { type, email, push, inApp } = input;
      
      const [updated] = await db
        .insert(notificationPreferences)
        .values({
          userId,
          type,
          email: email ?? true,
          push: push ?? true,
          inApp: inApp ?? true
        })
        .onConflictDoUpdate({
          target: [notificationPreferences.userId, notificationPreferences.type],
          set: {
            ...(email !== undefined && { email }),
            ...(push !== undefined && { push }),
            ...(inApp !== undefined && { inApp }),
          }
        })
        .returning();
      
      return updated;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string().uuid(), createdAt: z.date() }).nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(notifications),
          actor: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          video: {
            id: videos.id,
            title: videos.title,
            thumbnailUrl: videos.thumbnailUrl,
          },
          post: {
            id: posts.id,
            content: posts.content,
          },
          comment: {
            id: comments.id,
            value: comments.value,
            imageUrl: comments.imageUrl,
          },
        })
        .from(notifications)
        .innerJoin(users, eq(notifications.actorId, users.id))
        .leftJoin(videos, eq(notifications.videoId, videos.id))
        .leftJoin(posts, eq(notifications.postId, posts.id))
        .leftJoin(comments, eq(notifications.commentId, comments.id))
        .where(
          and(
            eq(notifications.userId, userId),
            cursor
              ? or(
                  lt(notifications.createdAt, cursor.createdAt),
                  and(
                    eq(notifications.createdAt, cursor.createdAt),
                    lt(notifications.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(notifications.createdAt), desc(notifications.id))
        .limit(limit + 1);

      const hasNextPage = data.length > limit;
      const items = hasNextPage ? data.slice(0, limit) : data;

      const nextCursor = hasNextPage
        ? {
            id: items[items.length - 1].id,
            createdAt: items[items.length - 1].createdAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const [data] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return {
      count: data?.count || 0,
    };
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [updated] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, userId)))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updated;
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    return { success: true };
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [deleted] = await db
        .delete(notifications)
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, userId)))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deleted;
    }),
});
