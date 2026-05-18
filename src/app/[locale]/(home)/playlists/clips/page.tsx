import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { ClipsView } from "@/modules/playlists/ui/views/clips-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tSidebar = await getTranslations({ locale, namespace: "Sidebar" });
  const tClips = await getTranslations({ locale, namespace: "Clips" });

  return {
    title: `${tSidebar("yourClips")} - NewTub`,
    description: tClips("description"),
  };
}

const Page = async () => {
  void trpc.clips.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return ( 
    <HydrateClient>
      <ClipsView />
    </HydrateClient>
  );
}
 
export default Page;
