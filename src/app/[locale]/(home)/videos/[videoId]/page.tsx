import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { VideoView } from "@/modules/videos/ui/views/video-view";

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    videoId: string;
    locale: string;
  }>;
}

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { videoId, locale } = await params;
  
  if (!isUuid(videoId)) {
    return {
      title: "Video not found",
    };
  }
  
  const [video] = await db
    .select({
      title: videos.title,
      description: videos.description,
      thumbnailUrl: videos.thumbnailUrl,
      duration: videos.duration,
      createdAt: videos.createdAt,
      user: {
        name: users.name,
        handle: users.handle,
      }
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.id, videoId))
    .limit(1);

  if (!video) {
    return {
      title: "Video not found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-code-v1.vercel.app';
  const videoUrl = `${baseUrl}/${locale}/videos/${videoId}`;
  const thumbnailUrl = video.thumbnailUrl || `${baseUrl}/og-image.png`;

  return {
    title: video.title,
    description: video.description || `Watch ${video.title} on Hayase-Yuuka`,
    alternates: {
      canonical: videoUrl,
    },
    openGraph: {
      title: video.title,
      description: video.description || undefined,
      url: videoUrl,
      siteName: 'Hayase-Yuuka',
      images: [
        {
          url: thumbnailUrl,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'video.other',
      videos: [
        {
          url: `${baseUrl}/${locale}/embed/${videoId}`,
          width: 1280,
          height: 720,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description || undefined,
      images: [thumbnailUrl],
      creator: video.user.handle ? `@${video.user.handle}` : undefined,
    },
    other: {
      "video:duration": Math.floor(video.duration / 1000).toString(),
      "video:release_date": video.createdAt.toISOString(),
      "video:tag": "video",
    }
  };
}

const Page = async ({ params }: PageProps) => {
  const { videoId, locale } = await params;

  if (!isUuid(videoId)) {
    return notFound();
  }

  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT });
  void trpc.suggestions.getMany.prefetchInfinite({ videoId, limit: DEFAULT_LIMIT });

  const [video] = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      thumbnailUrl: videos.thumbnailUrl,
      duration: videos.duration,
      viewsCount: videos.viewsCount,
      createdAt: videos.createdAt,
      user: {
        name: users.name,
        imageUrl: users.imageUrl,
      }
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.id, videoId))
    .limit(1);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-code-v1.vercel.app';

  const jsonLd = video ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.createdAt.toISOString(),
    duration: `PT${video.duration}S`,
    contentUrl: `${baseUrl}/${locale}/videos/${video.id}`,
    embedUrl: `${baseUrl}/${locale}/embed/${video.id}`,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: video.viewsCount,
    },
    author: {
      '@type': 'Person',
      name: video.user.name,
    }
  } : null;

  return ( 
    <HydrateClient>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};
 
export default Page;
