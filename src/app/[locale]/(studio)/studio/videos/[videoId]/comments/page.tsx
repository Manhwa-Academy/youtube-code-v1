import { HydrateClient, trpc } from "@/trpc/server";
import { CommunityView } from "@/modules/studio/ui/views/community-view";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    videoId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  void trpc.studio.getCommunityComments.prefetchInfinite({ 
    limit: 20,
    videoId,
  });

  return (
    <HydrateClient>
      <Suspense fallback={<div className="p-8">Đang tải bình luận video...</div>}>
        <ErrorBoundary fallback={<div className="p-8 text-red-500">Đã xảy ra lỗi khi tải bình luận video</div>}>
          <CommunityView videoId={videoId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
