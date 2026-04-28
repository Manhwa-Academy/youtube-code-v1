import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, or, lt, desc, getTableColumns } from "drizzle-orm";
import {
  subscriptions,
  comments,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { db } from "@/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)));

      if (!video) throw new TRPCError({ code: "NOT_FOUND" });

      return video;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    // Tổng số người đăng ký
    const totalSubscribers = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, userId))
      .execute();

    // Bình luận mới nhất 5 cái
    const latestComments = await db
      .select({
        id: comments.id,
        value: comments.value,
        userName: users.name,
        userAvatar: users.imageUrl,
        videoThumbnail: videos.thumbnailUrl, // thêm dòng này
        videoTitle: videos.title, // thêm dòng này
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .innerJoin(videos, eq(comments.videoId, videos.id))
      .where(eq(videos.userId, userId))
      .orderBy(desc(comments.createdAt))
      .limit(5)
      .execute();

    // Người đăng ký gần đây 5 cái
    const recentSubscribers = await db
      .select({
        viewerId: subscriptions.viewerId,
        name: users.name,
        avatarUrl: users.imageUrl,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.viewerId, users.id))
      .where(eq(subscriptions.creatorId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(5)
      .execute();

    return {
      totalSubscribers: totalSubscribers.length,
      latestComments,
      recentSubscribers,
    };
  }),

  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      // Lấy video và thống kê
      const data = await db
        .select({
          ...getTableColumns(videos),
          viewCount: videos.viewsCount, // tổng viewCount,
          commentCount: db.$count(comments, eq(comments.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.type, "like"),
              eq(videoReactions.videoId, videos.id),
            ),
          ),
        })
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      // Tính tỷ lệ xem trung bình cho từng video
      const itemsWithAvgView = await Promise.all(
        items.map(async (v) => {
          const views = await db
            .select({ progress: videoViews.progress })
            .from(videoViews)
            .where(eq(videoViews.videoId, v.id))
            .execute();
          const averageViewPercent = views.length
            ? Math.floor(
                views.reduce((acc, curr) => acc + curr.progress, 0) /
                  views.length,
              )
            : 0;
          return { ...v, averageViewPercent };
        }),
      );

      const lastItem = itemsWithAvgView[itemsWithAvgView.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items: itemsWithAvgView, nextCursor };
    }),
});
