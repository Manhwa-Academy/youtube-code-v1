"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";

import { trpc } from "@/trpc/client";
import { VideoSection } from "../sections/video-section";
import { CommentsSection } from "../sections/comments-section";
import { SuggestionsSection } from "../sections/suggestions-section";
import { ShortsActions } from "../components/shorts-actions";
import { ShortsInfo } from "../components/shorts-info";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VideoViewProps {
  videoId: string;
}

export const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <Suspense fallback={<div className="flex justify-center pt-20 text-muted-foreground animate-pulse font-medium">Đang chuẩn bị video...</div>}>
      <VideoViewSuspense videoId={videoId} />
    </Suspense>
  );
};

const VideoViewSuspense = ({ videoId }: VideoViewProps) => {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      const isFromVideo = referrer.includes("/videos/");
      const sessionDepth = parseInt(sessionStorage.getItem("shorts_nav_depth") || "0");

      // Nếu đến từ trang không phải video (ví dụ Trang chủ), reset depth về 0
      if (!isFromVideo && sessionDepth > 0 && !window.location.pathname.includes(videoId)) {
         // Đây là trường hợp hiếm, nhưng để chắc chắn ta chỉ tin vào referrer khi bắt đầu session mới
      }

      if (sessionDepth > 0) {
        setCanGoBack(true);
      }
    }
  }, [videoId]);

  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  
  // Logic xác định là Shorts: dưới 1 phút hoặc tỉ lệ khung hình dọc
  const isShort = (video.videoHeight || 0) > (video.videoWidth || 0);

  // Lấy suggestions để xử lý nút "Next" cho Shorts
  const { data: suggestions } = trpc.suggestions.getMany.useQuery({ 
    videoId, 
    limit: 5,
    isShort,
  });

  const handleNextShort = () => {
    if (suggestions?.items?.length) {
      const nextId = suggestions.items[0].id;
      const currentDepth = parseInt(sessionStorage.getItem("shorts_nav_depth") || "0");
      sessionStorage.setItem("shorts_nav_depth", (currentDepth + 1).toString());
      router.push(`/videos/${nextId}`);
    }
  };

  const handlePrevShort = () => {
    const currentDepth = parseInt(sessionStorage.getItem("shorts_nav_depth") || "0");
    if (currentDepth > 0) {
      sessionStorage.setItem("shorts_nav_depth", (currentDepth - 1).toString());
      router.back();
    }
  };

  const [loopEnabled, setLoopEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("loop");
    return saved === "true";
  });

  const [autoNextEnabled, setAutoNextEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("autoNext");
    return saved === null ? true : saved === "true";
  });

  const toggleLoop = () => {
    const newState = !loopEnabled;
    setLoopEnabled(newState);
    localStorage.setItem("loop", newState.toString());
  };

  const toggleAutoNext = () => {
    const newState = !autoNextEnabled;
    setAutoNextEnabled(newState);
    localStorage.setItem("autoNext", newState.toString());
  };

  const handleNotInterested = () => {
    toast.success("Đã ẩn video tạm thời");
    handleNextShort();
  };

  if (isShort) {
    return (
      <div className="flex justify-center pt-4 md:pt-6 min-h-[calc(100vh-80px)] bg-black md:bg-transparent pb-10">
        <div className="flex gap-4 md:gap-6 max-w-full">
          {/* 🎬 Khung trình phát Shorts */}
          <div className="relative aspect-[9/16] h-[75vh] md:h-[82vh] lg:h-[86vh] bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-800">
            <VideoSection 
              videoId={videoId} 
              hideInfo 
              loopEnabled={loopEnabled} 
            />
            
            {/* 📝 Thông tin Overlay (Tên kênh, tiêu đề...) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32 pb-12 z-0 pointer-events-none">
              <div className="pointer-events-auto">
                <ShortsInfo video={video} />
              </div>
            </div>
          </div>

          {/* ⚡ Cột nút hành động (Like, Dislike, Comment...) */}
          <div className="flex flex-col justify-end pb-2">
            <ShortsActions 
              video={video} 
              isLooping={loopEnabled}
              onToggleLoop={toggleLoop}
              isAutoNext={autoNextEnabled}
              onToggleAutoNext={toggleAutoNext}
              onNext={handleNextShort}
              onNotInterested={handleNotInterested}
            />
          </div>

          {/* ⬆️⬇️ Cột điều hướng riêng biệt */}
          <div className="flex flex-col justify-end pb-2 gap-2">
            {canGoBack && (
              <Button
                onClick={handlePrevShort}
                size="icon"
                variant="secondary"
                className="size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-lg"
              >
                <ChevronUpIcon className="size-8" />
              </Button>
            )}
            <Button
              onClick={handleNextShort}
              size="icon"
              variant="secondary"
              className="size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-lg"
            >
              <ChevronDownIcon className="size-8" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện Video bình thường (16:9)
  return (
    <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <div className="xl:hidden block mt-4">
            <SuggestionsSection videoId={videoId} isManual isShort={isShort} />
          </div>
          <CommentsSection videoId={videoId} />
        </div>
        <div className="hidden xl:block w-full xl:w-[380px] 2xl:w-[460px] shrink-1">
          <SuggestionsSection videoId={videoId} isShort={isShort} />
        </div>
      </div>
    </div>
  );
};
