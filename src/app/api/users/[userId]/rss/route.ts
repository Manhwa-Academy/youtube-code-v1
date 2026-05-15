import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const publicVideos = await db
    .select()
    .from(videos)
    .where(and(eq(videos.userId, userId), eq(videos.visibility, "public")))
    .orderBy(desc(videos.createdAt))
    .limit(20);

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "vi";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://youtube-code-v1.vercel.app";
  const channelUrl = `${baseUrl}/${lang}/users/${userId}`;

  const rssItems = publicVideos
    .map((video) => `
    <item>
      <title><![CDATA[${video.title}]]></title>
      <link>${baseUrl}/${lang}/videos/${video.id}</link>
      <description><![CDATA[${video.description || ""}]]></description>
      <pubDate>${video.createdAt.toUTCString()}</pubDate>
      <guid isPermaLink="false">${video.id}</guid>
      <media:content url="${video.thumbnailUrl || ""}" medium="image" />
    </item>`)
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title><![CDATA[${user.name} - Hayase-Yuuka]]></title>
    <link>${channelUrl}</link>
    <description><![CDATA[${user.bio || "Channel on Hayase-Yuuka"}]]></description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
