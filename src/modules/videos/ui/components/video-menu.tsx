import { toast } from "sonner";
import { useState } from "react";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
  PlusIcon,
  ListVideoIcon,
  FlagIcon,
} from "lucide-react";

import { useIsOnline } from "@/hooks/use-is-online";
import { downloadManager } from "@/lib/download-manager";

import { APP_URL } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";
import { MixPlaylistCreateModal } from "@/modules/playlists/ui/components/mix-playlist-create-modal";
import { MixPlaylistAddModal } from "@/modules/playlists/ui/components/mix-playlist-add-modal";
import { ReportModal } from "@/modules/reports/ui/components/report-modal";
import { usePlayerStore } from "@/modules/videos/store/use-player-store";

interface VideoMenuProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  playbackId?: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

export const VideoMenu = ({
  videoId,
  title,
  thumbnailUrl,
  playbackId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const isOnline = useIsOnline();
  const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [isOpenMixAddModal, setIsOpenMixAddModal] = useState(false);
  const [isOpenReportModal, setIsOpenReportModal] = useState(false);
  
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const onRemoveDownload = async () => {
    if (!playbackId) return;
    try {
      await downloadManager.removeVideo(videoId, playbackId);
      toast.success("Đã xóa nội dung tải xuống");
      if (onRemove) onRemove(); // Trigger refresh if onRemove is provided
      else window.location.reload(); // Fallback to refresh the view
    } catch (e) {
      toast.error("Lỗi khi xóa video");
    }
  };

  const onShare = () => {
    const fullUrl = `${APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Đã sao chép liên kết");
  };

  const handleAddToQueue = () => {
    if (!title || !playbackId) {
      toast.error("Không thể thêm vào hàng chờ: Thiếu thông tin");
      return;
    }
    addToQueue({
      id: videoId,
      title,
      thumbnailUrl,
      playbackId,
    });
    toast.success("Đã thêm vào hàng chờ");
  };

  return (
    <>
      {/* thêm vào danh sách phát thường */}
      <PlaylistAddModal
        videoId={videoId}
        open={isOpenPlaylistAddModal}
        onOpenChange={setIsOpenPlaylistAddModal}
      />

      {/* tạo danh sách kết hợp */}
      <MixPlaylistCreateModal
        open={isOpenCreateModal}
        onOpenChange={setIsOpenCreateModal}
        initialVideoIds={[videoId]}
      />
      <MixPlaylistAddModal
        videoId={videoId}
        open={isOpenMixAddModal}
        onOpenChange={setIsOpenMixAddModal}
      />
      <ReportModal
        targetId={videoId}
        targetType="video"
        isOpen={isOpenReportModal}
        onClose={() => setIsOpenReportModal(false)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {isOnline ? (
            <>
              <DropdownMenuItem onClick={handleAddToQueue}>
                <ListVideoIcon className="mr-2 size-4" />
                Thêm vào hàng chờ
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onShare}>
                <ShareIcon className="mr-2 size-4" />
                Chia sẻ
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setIsOpenPlaylistAddModal(true)}>
                <ListPlusIcon className="mr-2 size-4" />
                Thêm vào danh sách phát
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setIsOpenCreateModal(true)}>
                <PlusIcon className="mr-2 size-4" />
                Tạo danh sách kết hợp mới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOpenMixAddModal(true)}>
                <ListPlusIcon className="mr-2 size-4" />
                Thêm vào danh sách kết hợp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOpenReportModal(true)}>
                <FlagIcon className="mr-2 size-4" />
                Báo cáo vi phạm
              </DropdownMenuItem>
              {onRemove && (
                <DropdownMenuItem onClick={onRemove}>
                  <Trash2Icon className="mr-2 size-4" />
                  Xóa khỏi lịch sử
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={onRemoveDownload}>
                <Trash2Icon className="mr-2 size-4" />
                Xóa nội dung tải xuống
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
