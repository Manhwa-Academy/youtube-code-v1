import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";

import { SubscribedView } from "@/modules/home/ui/views/subscribed-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sidebar" });

  return {
    title: t("subscriptions"),
    description: t("subscriptionsDescription"),
  };
}

const Page = async () => {
  void trpc.videos.getManySubscribed.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <SubscribedView />
    </HydrateClient>
  );
};

export default Page;
