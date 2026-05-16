import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";

import { StudioView } from "@/modules/studio/ui/views/studio-view";

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio" });

  return {
    title: t("dashboard"),
  };
}

const Page = async () => {
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return ( 
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};
 
export default Page;
