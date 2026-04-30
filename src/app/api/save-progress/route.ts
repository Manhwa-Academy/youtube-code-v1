import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, videoViews } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ ok: false });

  const body = await req.json();
  const { videoId, progress } = body;

  const [me] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!me || !me.trackHistory) return NextResponse.json({ ok: true });

  await db
    .insert(videoViews)
    .values({
      userId: me.id,
      videoId,
      progress,
    })
    .onConflictDoUpdate({
      target: [videoViews.userId, videoViews.videoId],
      set: {
        progress,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}