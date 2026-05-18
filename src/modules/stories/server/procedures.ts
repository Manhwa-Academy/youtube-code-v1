import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, gt, asc } from "drizzle-orm";
import { db } from "@/db";
import { stories, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";

export const storiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        mediaUrl: z.string().url(),
        mediaType: z.enum(["image", "video"]).default("image"),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      // Set expiration to 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const [newStory] = await db
        .insert(stories)
        .values({
          userId,
          mediaUrl: input.mediaUrl,
          mediaType: input.mediaType,
          caption: input.caption || null,
          expiresAt,
        })
        .returning();

      return newStory;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const [deleted] = await db
        .delete(stories)
        .where(and(eq(stories.id, input.id), eq(stories.userId, userId)))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Story not found or not owned by you.",
        });
      }

      return deleted;
    }),

  getActiveGroups: baseProcedure.query(async () => {
    const now = new Date();

    // Fetch all stories that have not expired, ordered by oldest to newest (asc)
    const activeStories = await db
      .select({
        story: stories,
        user: users,
      })
      .from(stories)
      .innerJoin(users, eq(stories.userId, users.id))
      .where(gt(stories.expiresAt, now))
      .orderBy(asc(stories.createdAt));

    // Group stories by userId in memory for maximum performance
    const groupsMap = new Map<string, {
      user: typeof users.$inferSelect;
      stories: (typeof stories.$inferSelect)[];
    }>();

    for (const item of activeStories) {
      const { story, user } = item;
      if (!groupsMap.has(story.userId)) {
        groupsMap.set(story.userId, {
          user,
          stories: [],
        });
      }
      groupsMap.get(story.userId)!.stories.push(story);
    }

    return Array.from(groupsMap.values());
  }),
});
