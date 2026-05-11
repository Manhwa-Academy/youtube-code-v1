"use client";

import { useMemo, useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { vi } from "date-fns/locale";

import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";
import { VideoMenu } from "./video-menu";
import { VideoDescription } from "./video-description";
import { VideoGetOneOutput } from "../../types";
import { VideoPlaybackMenu } from "./video-playback-menu";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
  playerRef: React.RefObject<any>; // 🔹 ref tới MuxPlayer
  autoNextEnabled: boolean;
  setAutoNextEnabledAction: (v: boolean) => void;
  loopEnabled: boolean;
  setLoopEnabledAction: (v: boolean) => void;
}

export const VideoTopRowSkeleton = () => (
  <div className="flex flex-col gap-4 mt-4">
    <div className="h-6 w-4/5 bg-gray-300 rounded" />
    <div className="h-5 w-3/5 bg-gray-300 rounded" />
  </div>
);

export const VideoTopRow = ({
  video,
  playerRef,
  autoNextEnabled,
  setAutoNextEnabledAction,
  loopEnabled,
  setLoopEnabledAction,
}: VideoTopRowProps) => {
  const [playbackRate, setPlaybackRate] = useState(1);

  // Áp dụng playbackRate trực tiếp
  useEffect(() => {
    if (playerRef.current) playerRef.current.playbackRate = playbackRate;
  }, [playbackRate, playerRef]);

  const compactViews = useMemo(
    () =>
      Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
        video.viewCount,
      ),
    [video.viewCount],
  );

  const expandedViews = useMemo(
    () => Intl.NumberFormat("vi-VN").format(video.viewCount),
    [video.viewCount],
  );

  const compactDate = useMemo(
    () =>
      formatDistanceToNowStrict(new Date(video.createdAt), {
        addSuffix: true,
        locale: vi,
      }),
    [video.createdAt],
  );

  const expandedDate = useMemo(
    () => new Date(video.createdAt).toLocaleDateString("vi-VN"),
    [video.createdAt],
  );
  const handlePiP = async () => {
    try {
      const player = playerRef.current;
      if (!player) return;

      // MuxPlayer is a web component, we need to find the video element
      // It might be in shadowRoot or directly in the element depending on version/config
      const videoElement = player.shadowRoot?.querySelector("video") || player.querySelector("video");

      if (videoElement) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoElement.requestPictureInPicture();
        }
      } else {
        toast.error("Trình duyệt của bạn không hỗ trợ hoặc không tìm thấy video");
      }
    } catch (error) {
      console.error("PiP ERROR:", error);
      toast.error("Không thể mở chế độ hình trong hình");
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />

        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions
            videoId={video.id}
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            viewerReaction={video.viewerReaction}
            showLikeCount={video.showLikeCount}
          />

          <Button 
            variant="secondary" 
            className="rounded-full px-4 font-bold text-xs flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 border-none h-9"
            onClick={handlePiP}
            title="Xem dạng popup"
          >
            <ExternalLinkIcon className="size-4" />
            <span className="hidden md:inline">Popup</span>
          </Button>

          {/* 🔹 VideoPlaybackMenu tự động lấy track từ playerRef */}
          <VideoPlaybackMenu
            video={video}
            playerRef={playerRef}
            playbackId={video.muxPlaybackId}
            assetId={video.muxAssetId}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            autoNextEnabled={autoNextEnabled}
            setAutoNextEnabledAction={setAutoNextEnabledAction}
            loopEnabled={loopEnabled}
            setLoopEnabledAction={setLoopEnabledAction}
          />

          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>

      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};
