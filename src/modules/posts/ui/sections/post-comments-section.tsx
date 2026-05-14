"use client";

import { Suspense, useState } from "react";
import { Loader2Icon, ListFilterIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";

interface PostCommentsSectionProps {
  postId: string;
  canComment: boolean;
}

export const PostCommentsSection = ({ postId, canComment }: PostCommentsSectionProps) => {
  return (
    <Suspense fallback={<PostCommentsSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PostCommentsSectionSuspense postId={postId} canComment={canComment} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const PostCommentsSectionSkeleton = () => {
  return (
    <div className="mt-6 flex justify-center items-center">
      <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
    </div>
  );
};

const PostCommentsSectionSuspense = ({ postId, canComment }: PostCommentsSectionProps) => {
  const t = useTranslations("Posts");
  const [sortBy, setSortBy] = useState<"top" | "newest">("top");

  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      postId,
      limit: DEFAULT_LIMIT,
      sortBy,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const total = comments.pages[0]?.totalCount || 0;

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold">{t("commentsCount", { count: total })}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <ListFilterIcon className="size-3" />
                {t("sortBy")}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSortBy("top")}>
                {t("topComments")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                {t("newestFirst")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {canComment ? (
          <CommentForm postId={postId} />
        ) : (
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {t("commentsDisabled")}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-2">
          {comments.pages.flatMap((page) => page.items).map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          <InfiniteScroll
            isManual
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
          />
        </div>
      </div>
    </div>
  );
};
