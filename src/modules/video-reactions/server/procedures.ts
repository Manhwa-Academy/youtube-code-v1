import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { videoReactions, videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { dispatchNotification } from "@/modules/notifications/server/service";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
          )
        );

      if (existingReaction) {
        if (existingReaction.type === "like") {
          const [deletedViewerReaction] = await db
            .delete(videoReactions)
            .where(
              and(
                eq(videoReactions.userId, userId),
                eq(videoReactions.videoId, videoId)
              )
            )
            .returning();
          return deletedViewerReaction;
        } else {
          const [updatedReaction] = await db
            .update(videoReactions)
            .set({ type: "like" })
            .where(
              and(
                eq(videoReactions.userId, userId),
                eq(videoReactions.videoId, videoId)
              )
            )
            .returning();
          return updatedReaction;
        }
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "like" })
        .returning();

      if (createdVideoReaction) {
        const [video] = await db
          .select({ userId: videos.userId })
          .from(videos)
          .where(eq(videos.id, videoId));

        if (video && video.userId !== userId) {
          await dispatchNotification({
            userId: video.userId,
            actorId: userId,
            type: "video_like",
            videoId: videoId,
          });
        }
      }

      return createdVideoReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
          )
        );

      if (existingReaction) {
        if (existingReaction.type === "dislike") {
          const [deletedViewerReaction] = await db
            .delete(videoReactions)
            .where(
              and(
                eq(videoReactions.userId, userId),
                eq(videoReactions.videoId, videoId)
              )
            )
            .returning();
          return deletedViewerReaction;
        } else {
          const [updatedReaction] = await db
            .update(videoReactions)
            .set({ type: "dislike" })
            .where(
              and(
                eq(videoReactions.userId, userId),
                eq(videoReactions.videoId, videoId)
              )
            )
            .returning();
          return updatedReaction;
        }
      }

      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "dislike" })
        .returning();

      return createdVideoReaction;
    }),
});
