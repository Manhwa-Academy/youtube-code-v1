import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, videoViews } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ ok: false });

    const raw = await req.text();
    if (!raw) return NextResponse.json({ ok: false });

    const { videoId, progress } = JSON.parse(raw);

    if (!videoId) return NextResponse.json({ ok: false });

    const [me] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    if (!me || !me.trackHistory) return NextResponse.json({ ok: true });

    await db
      .insert(videoViews)
      .values({
        userId: me.id,
        videoId,
        progress: Math.floor(progress || 0),
      })
      .onConflictDoUpdate({
        target: [videoViews.userId, videoViews.videoId],
        set: {
          progress: Math.floor(progress || 0),
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("SAVE PROGRESS BEACON ERROR:", err);
    return NextResponse.json({ ok: false });
  }
}
