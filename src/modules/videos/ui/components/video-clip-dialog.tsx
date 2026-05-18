"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Scissors, Copy, Check, Play, MapPin, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/client";
import { VideoGetOneOutput } from "../../types";

interface VideoClipDialogProps {
  video: VideoGetOneOutput;
  playerRef: React.RefObject<any>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoClipDialog = ({
  video,
  playerRef,
  open,
  onOpenChange,
}: VideoClipDialogProps) => {
  const t = useTranslations("Video");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [isCopied, setIsCopied] = useState(false);
  const [createdClipId, setCreatedClipId] = useState<string | null>(null);

  const createClipMutation = trpc.clips.create.useMutation({
    onSuccess: (data) => {
      setCreatedClipId(data.id);
      toast.success("Tạo Clip thành công!");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể tạo Clip, vui lòng thử lại.");
    },
  });

  // Tự động điền mốc thời gian khi mở hộp thoại
  useEffect(() => {
    if (open) {
      setTitle("");
      setCreatedClipId(null);
      setIsCopied(false);

      const player = playerRef.current;
      const current = player ? Math.floor(player.currentTime || 0) : 0;
      const durationSec = Math.floor((video.duration || 0) / 1000);

      setStartTime(current);
      // Mặc định Clip dài 10 giây nhưng không vượt quá tổng độ dài video
      setEndTime(Math.min(current + 10, durationSec));
    }
  }, [open, playerRef, video.duration]);

  const duration = endTime - startTime;
  const isDurationValid = duration >= 5 && duration <= 60;
  const maxDurationSec = Math.floor((video.duration || 0) / 1000);

  const handleGetCurrentTime = (type: "start" | "end") => {
    const player = playerRef.current;
    if (!player) return;
    const current = Math.floor(player.currentTime || 0);

    if (type === "start") {
      setStartTime(current);
      if (endTime <= current) {
        setEndTime(Math.min(current + 10, maxDurationSec));
      }
    } else {
      if (current <= startTime) {
        toast.warning("Mốc kết thúc phải lớn hơn mốc bắt đầu!");
        return;
      }
      setEndTime(Math.min(current, maxDurationSec));
    }
  };

  const handlePreview = () => {
    const player = playerRef.current;
    if (!player) return;

    // Tìm video element thực tế (xử lý Shadow DOM chéo)
    const nativeVideo =
      player.media ||
      player.video ||
      player.shadowRoot?.querySelector("video") ||
      document.querySelector("video");

    if (nativeVideo) {
      nativeVideo.currentTime = startTime;
      nativeVideo.play().catch(() => {});
      toast.info(`Đang phát thử từ mốc ${formatSeconds(startTime)}`);
    }
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho Clip!");
      return;
    }
    if (startTime < 0 || endTime > maxDurationSec) {
      toast.error("Mốc thời gian không hợp lệ!");
      return;
    }
    createClipMutation.mutate({
      title,
      videoId: video.id,
      startTime,
      endTime,
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/videos/${video.id}?clipId=${createdClipId}`
    : "";

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success("Đã copy liên kết Clip vào bộ nhớ tạm!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-2xl">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Scissors className="size-5 text-violet-500 animate-pulse" />
            <span>Tạo Clip phân đoạn mới</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cắt một phân đoạn từ 5 đến 60 giây trong video này để chia sẻ nhanh với bạn bè của bạn!
          </DialogDescription>
        </DialogHeader>

        {createdClipId ? (
          /* MÀN HÌNH TẠO THÀNH CÔNG */
          <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
            <div className="size-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <Check className="size-8 stroke-[3]" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-100">Cắt Clip thành công!</h3>
              <p className="text-xs text-muted-foreground">Sao chép liên kết bên dưới để chia sẻ phân đoạn này.</p>
            </div>

            <div className="w-full mt-2 flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs outline-none text-muted-foreground font-mono truncate"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className={`h-8 rounded-lg text-xs gap-1.5 transition-all duration-200 ${
                  isCopied ? "bg-green-600 hover:bg-green-600 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"
                }`}
              >
                {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{isCopied ? "Đã copy" : "Copy Link"}</span>
              </Button>
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full rounded-xl text-xs h-10 border-neutral-200"
              onClick={() => onOpenChange(false)}
            >
              Đóng hộp thoại
            </Button>
          </div>
        ) : (
          /* MÀN HÌNH NHẬP THÔNG TIN TẠO */
          <div className="flex flex-col gap-5 py-3">
            {/* Nhập tiêu đề */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="clip-title" className="text-xs font-semibold">
                Tiêu đề Clip <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clip-title"
                placeholder="Ví dụ: Khoảnh khắc cười ra nước mắt..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="rounded-xl text-xs h-10 focus-visible:ring-violet-500 border-neutral-200 dark:border-neutral-800"
              />
            </div>

            {/* Cài đặt thời gian */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-time" className="text-xs font-semibold">
                  Bắt đầu (giây)
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="start-time"
                    type="number"
                    min={0}
                    max={maxDurationSec}
                    value={startTime}
                    onChange={(e) => setStartTime(Math.max(0, parseInt(e.target.value) || 0))}
                    className="rounded-xl text-xs h-10 pr-9 focus-visible:ring-violet-500 border-neutral-200 dark:border-neutral-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleGetCurrentTime("start")}
                    title="Ghim mốc hiện tại của player"
                    className="absolute right-2.5 p-1 rounded-md text-neutral-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                  >
                    <MapPin className="size-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono self-end">
                  ({formatSeconds(startTime)})
                </span>
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-time" className="text-xs font-semibold">
                  Kết thúc (giây)
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="end-time"
                    type="number"
                    min={1}
                    max={maxDurationSec}
                    value={endTime}
                    onChange={(e) => setEndTime(Math.min(maxDurationSec, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="rounded-xl text-xs h-10 pr-9 focus-visible:ring-violet-500 border-neutral-200 dark:border-neutral-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleGetCurrentTime("end")}
                    title="Ghim mốc hiện tại của player"
                    className="absolute right-2.5 p-1 rounded-md text-neutral-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                  >
                    <MapPin className="size-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono self-end">
                  ({formatSeconds(endTime)})
                </span>
              </div>
            </div>

            {/* Thông số độ dài và nút Xem trước */}
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-neutral-500">Độ dài phân đoạn:</span>
                <span className={`text-xs font-bold font-mono ${isDurationValid ? "text-neutral-800 dark:text-neutral-100" : "text-red-500"}`}>
                  {duration} giây
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="h-8 rounded-lg text-xs gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300 border-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Play className="size-3 fill-neutral-700 dark:fill-neutral-300 stroke-[3]" />
                <span>Xem thử</span>
              </Button>
            </div>

            {/* Text báo lỗi độ dài */}
            {!isDurationValid && (
              <p className="text-[10px] text-red-500 text-center font-medium leading-normal">
                ⚠️ Độ dài Clip đang là {duration}s. Độ dài bắt buộc phải từ 5 đến 60 giây để đảm bảo chất lượng!
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs h-10 border-neutral-200"
              >
                Hủy bỏ
              </Button>
              <Button
                disabled={!isDurationValid || createClipMutation.isPending}
                onClick={handleCreate}
                className="rounded-xl text-xs h-10 bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                {createClipMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Scissors className="size-3.5" />
                )}
                <span>Cắt & Tạo Clip</span>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
