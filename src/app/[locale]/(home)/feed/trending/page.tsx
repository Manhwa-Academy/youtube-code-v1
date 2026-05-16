import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";

import { TrendingView } from "@/modules/home/ui/views/trending-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sidebar" });

  return {
    title: t("trending"),
    description: t("trendingDescription"),
  };
}

const Page = async () => {
  void trpc.videos.getManyTrending.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  );
};

export default Page;
