"use client";

import { useClerk } from "@clerk/nextjs";
import { MessageSquareIcon, Share2Icon, ThumbsDownIcon, ThumbsUpIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { VideoGetOneOutput } from "../../types";
import { CommentsSection } from "../sections/comments-section";

interface ShortsActionsProps {
  video: VideoGetOneOutput;
}

export const ShortsActions = ({ video }: ShortsActionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: video.id });
    },
    onError: (error) => {
      toast.error("Đã xảy ra lỗi");
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: video.id });
    },
    onError: (error) => {
      toast.error("Đã xảy ra lỗi");
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("vi-VN", { notation: "compact" }).format(video.likeCount);
  }, [video.likeCount]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Like */}
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={() => like.mutate({ videoId: video.id })}
          disabled={like.isPending || dislike.isPending}
          size="icon"
          variant="secondary"
          className={cn(
            "size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-md",
            video.viewerReaction === "like" && "bg-white text-black hover:bg-neutral-200"
          )}
        >
          <ThumbsUpIcon className={cn("size-6", video.viewerReaction === "like" && "fill-current animate-likeBounce")} />
        </Button>
        <span className="text-xs font-medium text-black dark:text-white drop-shadow-sm">{compactLikes}</span>
      </div>

      {/* Dislike */}
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={() => dislike.mutate({ videoId: video.id })}
          disabled={like.isPending || dislike.isPending}
          size="icon"
          variant="secondary"
          className={cn(
            "size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-md",
            video.viewerReaction === "dislike" && "bg-white text-black hover:bg-neutral-200"
          )}
        >
          <ThumbsDownIcon className={cn("size-6", video.viewerReaction === "dislike" && "fill-current animate-likeBounce")} />
        </Button>
        <span className="text-xs font-medium text-black dark:text-white drop-shadow-sm">Không thích</span>
      </div>

      {/* Comments */}
      <div className="flex flex-col items-center gap-1">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-md"
            >
              <MessageSquareIcon className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[450px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Bình luận</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-10">
              <CommentsSection videoId={video.id} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-xs font-medium text-black dark:text-white drop-shadow-sm">{video.commentCount || 0}</span>
      </div>

      {/* Share */}
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={() => {
            const url = `${window.location.origin}/videos/${video.id}`;
            navigator.clipboard.writeText(url);
            toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
          }}
          size="icon"
          variant="secondary"
          className="size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-md"
        >
          <Share2Icon className="size-6" />
        </Button>
        <span className="text-xs font-medium text-black dark:text-white drop-shadow-sm">Chia sẻ</span>
      </div>

      {/* Remix */}
      <div className="flex flex-col items-center gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="size-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white shadow-md"
        >
          <RotateCcwIcon className="size-6" />
        </Button>
        <span className="text-xs font-medium text-black dark:text-white text-center leading-tight drop-shadow-sm">Phối lại</span>
      </div>
    </div>
  );
};
