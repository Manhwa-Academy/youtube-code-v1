import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { merchProducts, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";

export const merchRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        price: z.string().min(1),
        imageUrl: z.string().url(),
        externalLink: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const [newProduct] = await db
        .insert(merchProducts)
        .values({
          userId,
          title: input.title,
          price: input.price,
          imageUrl: input.imageUrl,
          externalLink: input.externalLink,
        })
        .returning();

      return newProduct;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;

      const [deleted] = await db
        .delete(merchProducts)
        .where(and(eq(merchProducts.id, input.id), eq(merchProducts.userId, userId)))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found or not owned by you.",
        });
      }

      return deleted;
    }),

  getManyByCreator: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userId } = input;
      let targetUserId = userId;

      // Support Clerk ID as well
      if (userId.startsWith("user_")) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, userId));
        if (!dbUser) throw new TRPCError({ code: "NOT_FOUND" });
        targetUserId = dbUser.id;
      }

      const products = await db
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.userId, targetUserId))
        .orderBy(desc(merchProducts.createdAt));

      return products;
    }),
});
