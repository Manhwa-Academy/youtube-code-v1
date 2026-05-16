import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { SubscriptionsView } from "@/modules/subscriptions/ui/views/subscriptions-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sidebar" });

  return {
    title: t("allSubscriptions"),
  };
}

const Page = async () => {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return ( 
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
   );
};
 
export default Page;
