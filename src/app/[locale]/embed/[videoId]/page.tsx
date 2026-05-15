"use client";

import { use } from "react";
import { trpc } from "@/trpc/client";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { Loader2Icon } from "lucide-react";

interface PageProps {
  params: Promise<{
    videoId: string;
    locale: string;
  }>;
}

const Page = ({ params }: PageProps) => {
  const { videoId } = use(params);

  const { data: video, isLoading } = trpc.videos.getOne.useQuery({ id: videoId });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[10000]">
        <Loader2Icon className="size-10 text-white animate-spin" />
      </div>
    );
  }

  if (!video || video.visibility !== "public") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white z-[10000]">
        Video not available
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[10000]">
      <VideoPlayer
        videoId={video.id}
        title={video.title}
        playbackId={video.muxPlaybackId}
        thumbnailUrl={video.thumbnailUrl}
        autoPlay={false}
        trackingEnabled={false}
      />
    </div>
  );
};

export default Page;
