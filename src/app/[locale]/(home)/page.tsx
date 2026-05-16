import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";

import { HomeView } from "@/modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sidebar" });

  return {
    title: t("home"),
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({ categoryId, limit: DEFAULT_LIMIT });
  void trpc.videos.getManyShorts.prefetchInfinite({ categoryId, limit: 20 });

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
