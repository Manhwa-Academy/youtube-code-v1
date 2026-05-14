"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { UserSearchCard } from "@/modules/users/ui/components/user-search-card";
import { useTranslations } from "next-intl";

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
  type: "all" | "video" | "shorts" | "channel" | undefined;
  duration: "any" | "under_3" | "3_to_20" | "over_20" | undefined;
  uploadDate: "any" | "today" | "this_week" | "this_month" | "this_year" | undefined;
};

export const ResultsSection = (props: ResultsSectionProps) => {
  const t = useTranslations("Search");
  return (
    <Suspense 
      key={`${props.query}-${props.categoryId}-${props.type}-${props.duration}-${props.uploadDate}`}  
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p className="text-center py-10">{t("errorSearch")}</p>}>
        <ResultsSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const ResultsSectionSkeleton = () => {
  return (
    <div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
      <div className="flex flex-col gap-4 p-4 gap-y-10 pt-6 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

const ResultsSectionSuspense = ({
  query,
  categoryId,
  type,
  duration,
  uploadDate,
}: ResultsSectionProps) => {
  const t = useTranslations("Search");
  const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    { 
      query, 
      categoryId, 
      type,
      duration,
      uploadDate,
      limit: DEFAULT_LIMIT 
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const items = results.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">{t("noMatchingResults")}</div>;
  }

  // 🔥 map progress cho mỗi video, default = 0
  const mapVideoWithProgress = (video: any) => ({
    ...video,
    progress: video.progress ?? 0,
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        {items.map((item: any) => {
          if (item.itemType === "channel") {
            return (
              <div key={`channel-${item.id}`} className="w-full">
                <UserSearchCard data={item} />
                <hr className="my-4 md:my-6 border-neutral-200 dark:border-neutral-800" />
              </div>
            );
          }

          const video = mapVideoWithProgress(item);

          return (
            <div key={`video-${video.id}`}>
              {/* Mobile / Grid */}
              <div className="block md:hidden mb-10">
                <VideoGridCard data={video} />
              </div>

              {/* Desktop / Row */}
              <div className="hidden md:block mb-4">
                <VideoRowCard data={video} progress={video.progress} />
              </div>
            </div>
          );
        })}
      </div>

      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        isFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </>
  )
}
