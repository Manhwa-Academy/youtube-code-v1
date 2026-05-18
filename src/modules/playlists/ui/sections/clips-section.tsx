"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { Scissors, Calendar, Eye, Clock, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";

export const ClipsSection = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<ClipsSectionSkeleton />}>
        <ClipsSectionSuspense />
      </Suspense>
    </ErrorBoundary>
  );
};

const ClipsSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 15 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 w-full">
          <div className="aspect-video w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="flex gap-3">
            <Skeleton className="size-9 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-3 w-[60%]" />
              <Skeleton className="h-3 w-[45%]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ClipsSectionSuspense = () => {
  const t = useTranslations("Clips");
  const locale = useLocale();
  
  const [clips, query] = trpc.clips.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const items = clips.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 max-w-md mx-auto animate-in fade-in duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-[1.8] blur-3xl opacity-20 dark:opacity-30 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600" />
          <div className="relative size-20 rounded-3xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 dark:shadow-violet-900/10">
            <Scissors className="size-10 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">
          {t("noClips")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t("noClipsDescription")}
        </p>
        <Button asChild className="rounded-2xl h-11 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
          <Link href="/">
            Khám phá video ngay <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  // Format duration helper (e.g. 10 -> "0:10", 65 -> "1:05")
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((clip) => {
          const duration = clip.endTime - clip.startTime;
          const formattedDate = new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
          }).format(new Date(clip.createdAt));

          return (
            <div
              key={clip.id}
              className="flex flex-col gap-2.5 w-full group relative bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 hover:border-violet-500/30 hover:bg-white dark:hover:bg-neutral-900/80 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Scissors Clip Label Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600/90 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md backdrop-blur-sm">
                <Scissors className="size-3 stroke-[2.5]" />
                Clip
              </div>

              {/* Clip Link / Thumbnail */}
              <Link
                prefetch
                href={`/videos/${clip.video.id}?clipId=${clip.id}`}
                className="relative flex-none aspect-video w-full rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300"
              >
                <VideoThumbnail
                  imageUrl={clip.video.thumbnailUrl}
                  previewUrl={null}
                  title={clip.title}
                  duration={duration}
                  progress={0}
                />
              </Link>

              {/* Clip Info */}
              <div className="flex gap-2.5 px-1 pb-1">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <Link
                    prefetch
                    href={`/videos/${clip.video.id}?clipId=${clip.id}`}
                    className="min-w-0"
                  >
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                      {clip.title}
                    </h3>
                  </Link>

                  {/* Original Video Title */}
                  <Link
                    prefetch
                    href={`/videos/${clip.video.id}`}
                    className="text-[11px] text-muted-foreground hover:text-violet-500 dark:hover:text-violet-400 transition-colors truncate mt-1 flex items-center gap-1"
                  >
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">Video gốc:</span>
                    <span className="truncate">{clip.video.title}</span>
                  </Link>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground border-t border-neutral-100 dark:border-neutral-800/80 pt-2 font-mono">
                    <span className="flex items-center gap-0.5">
                      <Clock className="size-3" />
                      {formattedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Scissors className="size-3" />
                      {duration} giây
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
