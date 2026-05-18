import { z } from "zod";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { clips, videos, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";

export const clipsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            createdAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          id: clips.id,
          title: clips.title,
          startTime: clips.startTime,
          endTime: clips.endTime,
          createdAt: clips.createdAt,
          video: {
            id: videos.id,
            title: videos.title,
            thumbnailUrl: videos.thumbnailUrl,
            duration: videos.duration,
            viewsCount: videos.viewsCount,
            createdAt: videos.createdAt,
          },
          creator: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
        })
        .from(clips)
        .innerJoin(videos, eq(clips.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(clips.userId, userId),
            cursor
              ? or(
                  lt(clips.createdAt, cursor.createdAt),
                  and(
                    eq(clips.createdAt, cursor.createdAt),
                    lt(clips.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(clips.createdAt), desc(clips.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      let nextCursor = null;
      if (hasMore && items.length > 0) {
        const lastItem = items[items.length - 1];
        nextCursor = {
          id: lastItem.id,
          createdAt: lastItem.createdAt,
        };
      }

      return {
        items,
        nextCursor,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Vui lòng nhập tiêu đề cho Clip").max(100, "Tiêu đề không được dài quá 100 ký tự"),
        videoId: z.string().uuid(),
        startTime: z.number().int().min(0),
        endTime: z.number().int().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, videoId, startTime, endTime } = input;
      const { id: userId } = ctx.user;

      const duration = endTime - startTime;
      if (duration < 5 || duration > 60) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Độ dài Clip phải nằm trong khoảng từ 5 đến 60 giây.",
        });
      }

      const [video] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy video gốc.",
        });
      }

      if (endTime > video.duration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Thời gian kết thúc không được vượt quá độ dài video.",
        });
      }

      const [newClip] = await db
        .insert(clips)
        .values({
          title,
          videoId,
          userId,
          startTime,
          endTime,
        })
        .returning();

      return newClip;
    }),

  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { id } = input;

      const [clip] = await db
        .select({
          id: clips.id,
          title: clips.title,
          startTime: clips.startTime,
          endTime: clips.endTime,
          createdAt: clips.createdAt,
          video: {
            id: videos.id,
            title: videos.title,
            muxPlaybackId: videos.muxPlaybackId,
            duration: videos.duration,
            userId: videos.userId,
          },
          creator: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
        })
        .from(clips)
        .innerJoin(videos, eq(clips.videoId, videos.id))
        .innerJoin(users, eq(clips.userId, users.id))
        .where(eq(clips.id, id));

      if (!clip) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy Clip này.",
        });
      }

      return clip;
    }),
});
