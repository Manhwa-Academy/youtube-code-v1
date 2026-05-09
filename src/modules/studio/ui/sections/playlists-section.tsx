"use client";

import Link from "next/link";
import { Suspense } from "react";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "@/components/error-fallback";
import { trpc } from "@/trpc/client";
import { VISIBILITY_MAP } from "@/lib/status-map";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PlaylistsSectionProps {
  limit: number;
}

export const PlaylistsSection = ({ limit }: PlaylistsSectionProps) => {
  return (
    <Suspense key={limit} fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlaylistsSectionSuspense limit={limit} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistsSectionSkeleton = () => {
  return (
    <div className="border-y">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[510px]">Danh sách phát</TableHead>
            <TableHead>Chế độ hiển thị</TableHead>
            <TableHead>Ngày cập nhật</TableHead>
            <TableHead className="text-right pr-6">Số lượng video</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="pl-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-36" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="text-right pr-6">
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const PlaylistsSectionSuspense = ({ limit }: PlaylistsSectionProps) => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {
      limit,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Danh sách phát</TableHead>
              <TableHead>Chế độ hiển thị</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead className="text-right pr-6">Số lượng video</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.pages
              .flatMap((page) => page.items)
              .map((playlist) => (
                <Link
                  prefetch
                  href={`/playlists/${playlist.id}`}
                  key={playlist.id}
                  legacyBehavior
                >
                  <TableRow className="cursor-pointer">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0 w-36 aspect-video overflow-hidden rounded-md bg-black">
                          {playlist.thumbnailUrl ? (
                            <img
                              src={playlist.thumbnailUrl}
                              alt={playlist.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-muted-foreground text-xs">
                              Trống
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 bg-black/80 px-2 py-1 text-[10px] text-white flex items-center gap-1">
                             {playlist.videoCount} video
                          </div>
                        </div>
                        <div className="flex flex-col overflow-hidden gap-y-1">
                          <span className="text-sm font-medium line-clamp-1">
                            {playlist.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {playlist.visibility === "private" ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <Globe2Icon className="size-4 mr-2" />
                        )}
                        {
                          VISIBILITY_MAP[
                            playlist.visibility as keyof typeof VISIBILITY_MAP
                          ]
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(playlist.updatedAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right text-sm pr-6">
                      {playlist.videoCount}
                    </TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
