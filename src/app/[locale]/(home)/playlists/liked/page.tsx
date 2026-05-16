import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { LikedView } from "@/modules/playlists/ui/views/liked-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sidebar" });

  return {
    title: t("likedVideos"),
  };
}

const Page = async () => {
  void trpc.playlists.getLiked.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return ( 
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
}
 
export default Page;