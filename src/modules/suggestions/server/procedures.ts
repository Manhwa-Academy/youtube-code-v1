import { z } from "zod";
import { eq, and, getTableColumns, not, inArray, sql, gt, lte, isNotNull, or, isNull } from "drizzle-orm";

import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { processABTesting } from "@/lib/ab-testing";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        limit: z.number().min(1).max(20).default(5),
        excludeIds: z.array(z.string().uuid()).optional(),
        isShort: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { videoId, limit, excludeIds = [], isShort } = input;

      // Handle null dimensions gracefully: 
      // If it's a Short request, only return portrait videos.
      // If it's a standard landscape request, return landscape OR videos with NULL dimensions.
      const aspectFilter = isShort === undefined 
        ? undefined 
        : isShort 
          ? gt(videos.videoHeight, videos.videoWidth) 
          : or(
              lte(videos.videoHeight, videos.videoWidth),
              isNull(videos.videoHeight),
              isNull(videos.videoWidth)
            );

      // 🔍 Lấy video hiện tại
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      // 👤 Viewer hiện tại
      let viewerId: string | undefined;
      if (ctx.clerkUserId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, ctx.clerkUserId));
        viewerId = user?.id;
      }

      // Generate embedding for target video if not present (on the fly update)
      let targetEmbedding = existingVideo.embedding;
      if (!targetEmbedding) {
        try {
          const combinedText = `${existingVideo.title || ""} ${existingVideo.description || ""}`.trim();
          if (combinedText) {
            const { getEmbedding } = await import("@/lib/embeddings");
            targetEmbedding = await getEmbedding(combinedText);
            await db.update(videos).set({ embedding: targetEmbedding }).where(eq(videos.id, existingVideo.id));
          }
        } catch (e) {
          console.error("Failed to generate target embedding on the fly for suggestions:", e);
        }
      }

      // 🔥 List loại bỏ
      const excluded = [videoId, ...excludeIds];
      const vectorStr = targetEmbedding ? `[${targetEmbedding.join(",")}]` : null;

      let recommendationVideos: any[] = [];

      // ==========================================
      // 🎯 1. VECTOR EMBEDDING SIMILARITY QUERY (pgvector)
      // ==========================================
      if (vectorStr) {
        try {
          recommendationVideos = await db
            .select({
              ...getTableColumns(videos),
              user: users,
              progress: sql<number>`user_progress.progress`, // 🔹 progress user hiện tại
              viewCount: videos.viewsCount, // 🔹 tổng viewCount
              likeCount: db.$count(
                videoReactions,
                and(
                  eq(videoReactions.videoId, videos.id),
                  eq(videoReactions.type, "like"),
                ),
              ),
              dislikeCount: db.$count(
                videoReactions,
                and(
                  eq(videoReactions.videoId, videos.id),
                  eq(videoReactions.type, "dislike"),
                ),
              ),
            })
            .from(videos)
            .innerJoin(users, eq(videos.userId, users.id))
            .leftJoin(
              db.select({
                videoId: videoViews.videoId,
                userId: videoViews.userId,
                progress: sql<number>`MAX(${videoViews.progress})`.as("progress")
              })
              .from(videoViews)
              .where(viewerId ? eq(videoViews.userId, viewerId) : sql`1=0`)
              .groupBy(videoViews.videoId, videoViews.userId)
              .as("user_progress"),
              eq(videos.id, sql`user_progress.video_id`)
            )
            .where(
              and(
                eq(videos.visibility, "public"),
                aspectFilter, // 🔥 Lọc theo tỉ lệ khung hình
                not(inArray(videos.id, excluded)),
                isNotNull(videos.embedding) // Chỉ lấy các video đã có embedding để tính tương đồng
              ),
            )
            .orderBy(sql`${videos.embedding} <=> ${vectorStr}::vector`)
            .limit(limit);
        } catch (err) {
          console.error("Failed to fetch vector suggestions:", err);
        }
      }

      // ==========================================
      // 🔀 2. FALLBACK: Fill remaining slots with any public videos (even without embeddings)
      // ==========================================
      if (recommendationVideos.length < limit) {
        const remainingLimit = limit - recommendationVideos.length;
        const alreadyReturnedIds = [...excluded, ...recommendationVideos.map(v => v.id)];

        try {
          const fallbackVideos = await db
            .select({
              ...getTableColumns(videos),
              user: users,
              progress: sql<number>`user_progress.progress`,
              viewCount: videos.viewsCount,
              likeCount: db.$count(
                videoReactions,
                and(
                  eq(videoReactions.videoId, videos.id),
                  eq(videoReactions.type, "like"),
                ),
              ),
              dislikeCount: db.$count(
                videoReactions,
                and(
                  eq(videoReactions.videoId, videos.id),
                  eq(videoReactions.type, "dislike"),
                ),
              ),
            })
            .from(videos)
            .innerJoin(users, eq(videos.userId, users.id))
            .leftJoin(
              db.select({
                videoId: videoViews.videoId,
                userId: videoViews.userId,
                progress: sql<number>`MAX(${videoViews.progress})`.as("progress")
              })
              .from(videoViews)
              .where(viewerId ? eq(videoViews.userId, viewerId) : sql`1=0`)
              .groupBy(videoViews.videoId, videoViews.userId)
              .as("user_progress"),
              eq(videos.id, sql`user_progress.video_id`)
            )
            .where(
              and(
                eq(videos.visibility, "public"),
                aspectFilter,
                not(inArray(videos.id, alreadyReturnedIds))
              ),
            )
            .orderBy(sql`RANDOM()`)
            .limit(remainingLimit);

          recommendationVideos.push(...fallbackVideos);
        } catch (err) {
          console.error("Failed to fetch fallback suggestions:", err);
        }
      }

      const processedItems = await processABTesting(recommendationVideos);
      return { items: processedItems, nextCursor: null };
    }),
});
