"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { ListVideoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/empty-state";
import { PlaylistGridCard, PlaylistGridCardSkeleton } from "../components/playlist-grid-card";

export const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistsSectionSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {Array.from({ length: 18 }).map((_, index) => (
          <PlaylistGridCardSkeleton key={index} />
        ))
      }
    </div>
  );
};

const PlaylistsSectionSuspense = () => {
  const t = useTranslations("Home");
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const items = playlists.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ListVideoIcon}
        title={t("noPlaylists")}
        description={t("noPlaylistsDescription")}
      />
    );
  }

  return (
    <>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {items
          .map((playlist) => (
            <PlaylistGridCard
              key={playlist.id}
              data={playlist}
            />
          ))
        }
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  )
}