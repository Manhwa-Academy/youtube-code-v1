import { HydrateClient, trpc } from "@/trpc/server";
import { CommunityView } from "@/modules/studio/ui/views/community-view";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

const Page = async () => {
  void trpc.studio.getCommunityComments.prefetchInfinite({ limit: 20 });
  const t = await getTranslations("Studio");

  return (
    <HydrateClient>
      <Suspense fallback={<div className="p-8">{t("loadingCommunity")}</div>}>
        <ErrorBoundary fallback={<div className="p-8 text-red-500">{t("errorLoadingCommunity")}</div>}>
          <CommunityView />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
