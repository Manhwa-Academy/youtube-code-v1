"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { THUMBNAIL_FALLBACK } from "../../constants";
import { VideoBanner } from "../components/video-banner";
import {
  VideoPlayer,
  VideoPlayerSkeleton,
} from "../components/video-player";
import {
  VideoTopRow,
  VideoTopRowSkeleton,
} from "../components/video-top-row";

interface VideoSectionProps {
  videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const VideoSectionSkeleton = () => {
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  );
};

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();

  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  // 🔥 HISTORY CHỐNG LOOP
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory((prev) => {
      if (prev.includes(videoId)) return prev;
      return [...prev, videoId];
    });
  }, [videoId]);

  // 🔥 SUGGESTIONS (CHUẨN YOUTUBE)
  const { data: suggestions } = trpc.suggestions.getMany.useQuery({
    videoId,
    limit: 5,
    excludeIds: history, // 🔥 CHỐNG LẶP
  });

  // 🔥 RANDOM VIDEO TIẾP THEO
  const nextVideo = useMemo(() => {
    if (!suggestions?.items?.length) return undefined;

    const randomIndex = Math.floor(
      Math.random() * suggestions.items.length
    );

    const v = suggestions.items[randomIndex];

    return {
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl || THUMBNAIL_FALLBACK,
    };
  }, [suggestions]);

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  const handlePlay = () => {
    if (!isSignedIn) return;
    createView.mutate({ videoId });
  };

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none",
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
          nextVideo={nextVideo}
        />
      </div>

      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
