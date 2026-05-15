import { Metadata, ResolvingMetadata } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { playlists, users } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { VideosView } from "@/modules/playlists/ui/views/videos-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ 
    playlistId: string;
    locale: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { playlistId, locale } = await params;
  
  const [playlist] = await db
    .select({
      name: playlists.name,
      description: playlists.description,
      user: {
        name: users.name,
      }
    })
    .from(playlists)
    .innerJoin(users, eq(playlists.userId, users.id))
    .where(eq(playlists.id, playlistId))
    .limit(1);

  if (!playlist) {
    return {
      title: "Playlist not found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-code-v1.vercel.app';
  const playlistUrl = `${baseUrl}/${locale}/playlists/${playlistId}`;

  return {
    title: `${playlist.name} - Hayase-Yuuka`,
    description: playlist.description || `Watch ${playlist.name} by ${playlist.user.name} on Hayase-Yuuka`,
    openGraph: {
      title: playlist.name,
      description: playlist.description || undefined,
      url: playlistUrl,
      siteName: 'Hayase-Yuuka',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { playlistId } = await params;

  void trpc.playlists.getOne.prefetch({ id: playlistId });
  void trpc.playlists.getVideos.prefetchInfinite({ playlistId, limit: DEFAULT_LIMIT });

  return ( 
    <HydrateClient>
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  );
}
 
export default Page;
