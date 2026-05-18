"use client";

import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ErrorFallback } from "@/components/error-fallback";

import { THUMBNAIL_FALLBACK } from "../../constants";
import { VideoPlayer, VideoPlayerSkeleton } from "../components/video-player";
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

interface VideoSectionProps {
  videoId: string;
  hideInfo?: boolean;
  loopEnabled?: boolean;
}
export const VideoSection = ({ videoId, hideInfo, loopEnabled }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <VideoSectionSuspense 
          videoId={videoId} 
          hideInfo={hideInfo} 
          loopEnabled={loopEnabled} 
        />
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
type PlaylistVideo = {
  id: string;
  title: string;
  thumbnail?: string | null;
};

type Playlist = {
  id: string;
  name: string;
  videos: PlaylistVideo[];
};
const VideoSectionSuspense = ({ videoId, hideInfo, loopEnabled: loopEnabledProp }: VideoSectionProps) => {
  const t = useTranslations("Video");
  const params = useSearchParams();

  const clipId = params.get("clipId");
  const { data: clip } = trpc.clips.getOne.useQuery(
    { id: clipId || "" },
    { enabled: !!clipId }
  );

  const [showPlaylist, setShowPlaylist] = useState(false);
  const playlistId = params.get("list");
  const index = Number(params.get("index") || 0);
  const { data: trackingEnabled, isLoading: trackingLoading } =
    trpc.playlists.getHistoryTracking.useQuery();
  // ✅ fallback khi loading hoặc guest

  const [currentVideoId, setCurrentVideoId] = useState(videoId);
  const [currentIndex, setCurrentIndex] = useState(index);

  const [autoNextEnabled, setAutoNextEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("autoNext");
    return saved === null ? true : saved === "true";
  });

  const [loopEnabled, setLoopEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("loop");
    return saved === "true";
  });

  const [video] = trpc.videos.getOne.useSuspenseQuery(
    { id: currentVideoId },
    {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  );
  const isVertical = (video.videoHeight || 0) > (video.videoWidth || 0);
  const localProgress =
    typeof window !== "undefined"
      ? parseInt(
          localStorage.getItem(`video-${currentVideoId}-progress`) || "0",
          10,
        )
      : 0;

  // Nếu video đã xem đến 2 giây cuối, coi như đã xem hết để xem lại từ đầu
  // LƯU Ý: video.duration trong DB đang là miliseconds (ms), cần chia 1000 để so với giây (s)
  const durationInSeconds = (video.duration || 0) / 1000;
  const isVideoFinished = (video.progress || 0) >= Math.max(durationInSeconds - 2, 0);
  const isLocalFinished = localProgress >= Math.max(durationInSeconds - 2, 0);

  const finalProgress = trackingEnabled 
    ? (isVideoFinished ? 0 : (video.progress || 0)) 
    : (isLocalFinished ? 0 : localProgress);

  // 🔹 playlist public
  const { data: playlists } =
    trpc.playlists.getPublicMixPlaylists.useQuery() as {
      data: Playlist[] | undefined;
    };

  const playlist = playlists?.find((p: Playlist) => p.id === playlistId);
  const next = playlist?.videos?.[currentIndex + 1];

  // 🔹 suggestion random nếu không có playlist
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    if (!playlistId) {
      setHistory((prev) =>
        prev.includes(currentVideoId) ? prev : [...prev, currentVideoId],
      );
    }
  }, [currentVideoId, playlistId]);

  const { data: suggestions } = trpc.suggestions.getMany.useQuery(
    { videoId: currentVideoId, limit: 5, excludeIds: history, isShort: isVertical },
    { enabled: !playlistId },
  );
  useEffect(() => {
    setCurrentVideoId(videoId);
  }, [videoId]);
  const nextVideo = useMemo(() => {
    if (playlistId && next) {
      return {
        id: next.id,
        title: next.title,
        thumbnail: next.thumbnail || THUMBNAIL_FALLBACK,
        playlistId,
        index: currentIndex + 1,
      };
    }

    if (!suggestions?.items?.length) return undefined;

    const randomIndex = Math.floor(Math.random() * suggestions.items.length);
    const v = suggestions.items[randomIndex];

    return {
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl || THUMBNAIL_FALLBACK,
    };
  }, [playlistId, next, suggestions, currentIndex]);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem("autoNext", autoNextEnabled.toString());
  }, [autoNextEnabled]);

  useEffect(() => {
    localStorage.setItem("loop", loopEnabled.toString());
  }, [loopEnabled]);
  if (trackingLoading || trackingEnabled === undefined) {
    return <VideoSectionSkeleton />;
  }

  const playerWrapperClass = isVertical
    ? cn(
        "aspect-[9/16] mx-auto w-full h-full",
        !hideInfo && "max-w-[470px] max-h-[550px]",
      )
    : "aspect-video";

  return (
    <div className={cn("flex flex-col gap-4", hideInfo && "h-full gap-0")}>
      {/* 🎬 PLAYER */}
      <div
        className={cn(
          playerWrapperClass,
          "rounded-xl overflow-hidden relative shadow-lg",
          !hideInfo && "w-full",
        )}
      >
        <VideoPlayer
          ref={playerRef}
          key={video.id}
          videoId={video.id}
          title={video.title}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
          savedProgress={trackingEnabled ? finalProgress : 0}
          trackingEnabled={trackingEnabled}
          autoPlay
          nextVideo={nextVideo}
          autoNextEnabled={autoNextEnabled}
          loopEnabled={loopEnabledProp ?? loopEnabled}
          isVertical={isVertical}
          clipStart={clip?.startTime}
          clipEnd={clip?.endTime}
        />
      </div>

      {/* ✂️ CLIP INFOBAR (If viewing a clip) */}
      {clip && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent border border-violet-500/20 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
              <Scissors className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-violet-500">
                  {t("playingClip")}
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {t("seconds", { count: clip.endTime - clip.startTime })}
                </span>
              </div>
              <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-tight">
                “{clip.title}”
              </h2>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                {t.rich("clippedBy", {
                  name: clip.creator.name,
                  bold: (chunks) => <span className="font-semibold text-neutral-700 dark:text-neutral-300">{chunks}</span>
                })}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete("clipId");
              window.history.pushState({}, "", url.toString());
              window.location.reload();
            }}
            className="rounded-xl text-xs h-9 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-md font-semibold transition-all duration-200 shrink-0"
          >
            {t("watchFullVideo")}
          </Button>
        </div>
      )}

      {/* 🧾 INFO */}
      {!hideInfo && (
        <VideoTopRow
          video={video}
          playerRef={playerRef}
          autoNextEnabled={autoNextEnabled}
          setAutoNextEnabledAction={setAutoNextEnabled}
          loopEnabled={loopEnabledProp ?? loopEnabled}
          setLoopEnabledAction={setLoopEnabled}
        />
      )}
    </div>
  );
};
