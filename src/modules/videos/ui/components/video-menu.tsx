import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
  PlusIcon,
  ListVideoIcon,
  FlagIcon,
  CodeIcon,
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
  const t = useTranslations("VideoMenu");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [isOpenMixAddModal, setIsOpenMixAddModal] = useState(false);
  const [isOpenReportModal, setIsOpenReportModal] = useState(false);
  
  const addToQueue = usePlayerStore((state) => state.addToQueue);

  const onRemoveDownload = async () => {
    if (!playbackId) return;
    try {
      await downloadManager.removeVideo(videoId, playbackId);
      toast.success(t("removeDownload"));
      if (onRemove) onRemove(); // Trigger refresh if onRemove is provided
      else window.location.reload(); // Fallback to refresh the view
    } catch (e) {
      toast.error(tGeneral("error"));
    }
  };

  const onShare = () => {
    const fullUrl = `${APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success(tGeneral("copySuccess"));
  };

  const onEmbed = () => {
    const embedCode = `<iframe width="560" height="315" src="${APP_URL}/${locale}/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success(t("embedCopied"));
  };

  const handleAddToQueue = () => {
    if (!title || !playbackId) {
      toast.error(t("queueError"));
      return;
    }
    addToQueue({
      id: videoId,
      title,
      thumbnailUrl,
      playbackId,
    });
    toast.success(t("queueSuccess"));
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
                {t("addToQueue")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onShare}>
                <ShareIcon className="mr-2 size-4" />
                {t("share")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onEmbed}>
                <CodeIcon className="mr-2 size-4" />
                {t("embed")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setIsOpenPlaylistAddModal(true)}>
                <ListPlusIcon className="mr-2 size-4" />
                {t("addToPlaylist")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setIsOpenCreateModal(true)}>
                <PlusIcon className="mr-2 size-4" />
                {t("createNewMix")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOpenMixAddModal(true)}>
                <ListPlusIcon className="mr-2 size-4" />
                {t("addToMix")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOpenReportModal(true)}>
                <FlagIcon className="mr-2 size-4" />
                {t("report")}
              </DropdownMenuItem>
              {onRemove && (
                <DropdownMenuItem onClick={onRemove}>
                  <Trash2Icon className="mr-2 size-4" />
                  {t("removeFromHistory")}
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={onRemoveDownload}>
                <Trash2Icon className="mr-2 size-4" />
                {t("removeDownload")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
