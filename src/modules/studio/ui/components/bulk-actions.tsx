"use client";

import { useState } from "react";
import { 
  Edit2Icon, 
  ListPlusIcon, 
  MoreVerticalIcon, 
  DownloadIcon, 
  Trash2Icon,
  ChevronDownIcon,
  XIcon
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/client";
import { useConfirm } from "@/hooks/use-confirm";

import { BulkEditModal } from "./bulk-edit-modal";

interface BulkActionsProps {
  selectedIds: string[];
  videos: any[]; // Adjust type if possible
  onClearSelection: () => void;
  onSuccess?: () => void;
}

export const BulkActions = ({ 
  selectedIds, 
  videos,
  onClearSelection,
  onSuccess 
}: BulkActionsProps) => {
  const [editField, setEditField] = useState<"title" | "description" | null>(null);
  const [ConfirmDialog, confirm] = useConfirm(
    "Xóa video?",
    "Hành động này sẽ xóa vĩnh viễn các video đã chọn. Bạn có chắc chắn không?"
  );

  const utils = trpc.useUtils();
  const removeMany = trpc.videos.removeMany.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa các video đã chọn");
      utils.studio.getMany.invalidate();
      onClearSelection();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa video");
    },
  });

  const updateMany = trpc.videos.updateMany.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật các video đã chọn");
      utils.studio.getMany.invalidate();
      onClearSelection();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật video");
    },
  });

  const { data: playlists } = trpc.playlists.getMany.useQuery({
    limit: 100,
  });

  const addManyVideos = trpc.playlists.addManyVideos.useMutation({
    onSuccess: (data) => {
      toast.success(`Đã thêm ${data.count} video vào danh sách phát`);
      onClearSelection();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm vào danh sách phát");
    },
  });

  const handleDelete = async () => {
    const ok = await confirm();
    if (ok) {
      removeMany.mutate({ ids: selectedIds });
    }
  };

  const handleUpdateVisibility = (visibility: "public" | "private") => {
    updateMany.mutate({ ids: selectedIds, visibility });
  };

  const handleBulkEdit = (value: string) => {
    if (!editField) return;
    updateMany.mutate({ 
      ids: selectedIds, 
      [editField]: value 
    });
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addManyVideos.mutate({ playlistId, videoIds: selectedIds });
  };

  const handleDownload = () => {
    const selectedVideos = videos.filter((v) => selectedIds.includes(v.id));
    
    if (selectedVideos.length === 0) return;

    toast.info(`Đang chuẩn bị tải xuống ${selectedVideos.length} video...`);

    selectedVideos.forEach((video) => {
      if (video.muxPlaybackId) {
        // Mux static rendition URL (assuming high.mp4 is available as per create procedure)
        const downloadUrl = `https://stream.mux.com/${video.muxPlaybackId}/high.mp4?download=${encodeURIComponent(video.title)}.mp4`;
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${video.title}.mp4`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });

    toast.success("Bắt đầu tải xuống");
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-6 dark:bg-zinc-950 border-b">
      <ConfirmDialog />
      <BulkEditModal 
        open={editField === "title"}
        onClose={() => setEditField(null)}
        onConfirm={handleBulkEdit}
        title="Chỉnh sửa tiêu đề"
        label="Tiêu đề mới"
        type="input"
        placeholder="Nhập tiêu đề mới cho tất cả video đã chọn"
      />
      <BulkEditModal 
        open={editField === "description"}
        onClose={() => setEditField(null)}
        onConfirm={handleBulkEdit}
        title="Chỉnh sửa mô tả"
        label="Mô tả mới"
        type="textarea"
        placeholder="Nhập mô tả mới cho tất cả video đã chọn"
      />
      <div className="flex items-center gap-x-4">
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
          <XIcon className="size-5" />
        </Button>
        <span className="text-sm font-medium">
          Đã chọn {selectedIds.length} ({selectedIds.length === 1 ? "Chọn tất cả" : "Chọn tất cả"})
        </span>
        
        <div className="h-6 w-px bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-x-2">
              Chỉnh sửa <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setEditField("title")}>
              Tiêu đề
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditField("description")}>
              Mô tả
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Quyền riêng tư</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleUpdateVisibility("public")}>
                  Công khai
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateVisibility("private")}>
                  Riêng tư
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-x-2">
              Thêm vào danh sách phát <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
            {playlists?.items.map((playlist) => (
              <DropdownMenuItem 
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                {playlist.name}
              </DropdownMenuItem>
            ))}
            {playlists?.items.length === 0 && (
              <DropdownMenuItem disabled>Không có danh sách phát</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-x-2">
              Thao tác khác <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleDownload}>
              <DownloadIcon className="size-4 mr-2" />
              Tải video xuống
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2Icon className="size-4 mr-2" />
              Xóa vĩnh viễn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
