import { Metadata, ResolvingMetadata } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { UserView } from "@/modules/users/ui/views/user-view";

interface PageProps {
  params: Promise<{
    userId: string;
    locale: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { userId, locale } = await params;
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return {
      title: "User not found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-code-v1.vercel.app';
  const profileUrl = `${baseUrl}/${locale}/users/${userId}`;
  const imageUrl = user.imageUrl || `${baseUrl}/og-image.png`;

  return {
    title: `${user.name} - Hayase-Yuuka`,
    description: user.bio || `Check out ${user.name}'s channel on Hayase-Yuuka`,
    openGraph: {
      title: user.name,
      description: user.bio || undefined,
      url: profileUrl,
      siteName: 'Hayase-Yuuka',
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
        },
      ],
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: user.name,
      description: user.bio || undefined,
      images: [imageUrl],
      creator: user.handle ? `@${user.handle}` : undefined,
    },
    alternates: {
      types: {
        'application/rss+xml': [
          { url: `${baseUrl}/api/users/${userId}/rss`, title: `${user.name}'s RSS Feed` },
        ],
      },
    },
  };
}

const Page = async ({ params }: PageProps) => {
  const { userId } = await params;

  void trpc.users.getOne.prefetch({ id: userId });
  void trpc.videos.getMany.prefetchInfinite({ userId, limit: DEFAULT_LIMIT });
  
  return ( 
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
};
 
export default Page;
