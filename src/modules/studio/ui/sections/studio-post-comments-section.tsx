"use client";

import { Suspense } from "react";
import { Loader2Icon, MessageSquareOffIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { useTranslations } from "next-intl";

interface StudioPostCommentsSectionProps {
  postId: string;
}

export const StudioPostCommentsSection = ({ postId }: StudioPostCommentsSectionProps) => {
  return (
    <Suspense fallback={<StudioPostCommentsSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <StudioPostCommentsSectionSuspense postId={postId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const StudioPostCommentsSectionSkeleton = () => {
  return (
    <div className="mt-6 flex justify-center items-center">
      <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
    </div>
  );
};

const StudioPostCommentsSectionSuspense = ({ postId }: StudioPostCommentsSectionProps) => {
  const t = useTranslations("Studio");
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      postId,
      limit: DEFAULT_LIMIT,
      sortBy: "newest",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const total = comments.pages[0]?.totalCount || 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-y-4">
        <MessageSquareOffIcon className="size-16 text-neutral-500" />
        <p className="text-neutral-400 text-sm">
          {t("noCommentsFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-6">
      {comments.pages.flatMap((page) => page.items).map((comment) => (
        <CommentItem key={comment.id} comment={comment} variant="studio" />
      ))}

      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
