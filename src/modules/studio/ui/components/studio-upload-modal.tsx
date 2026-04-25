"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";

import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video đang được tạo, bạn có thể bắt đầu upload ✨");
      utils.studio.getMany.invalidate();
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        "Đã xảy ra lỗi. Có thể đã đạt giới hạn video trên Mux hoặc lỗi server. Xóa video cũ hoặc liên hệ support nha.",
      );
    },
  });

  const handleSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  };

  const isOpen = !!create.data?.url;

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={isOpen}
        onOpenChange={() => create.reset()}
      >
        {isOpen ? (
          <StudioUploader
            endpoint={create.data?.url || ""}
            onSuccess={handleSuccess}
          />
        ) : (
          <Loader2Icon className="animate-spin text-muted-foreground mx-auto my-12" />
        )}
      </ResponsiveModal>

      <Button
        variant="secondary"
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
        ) : (
          <PlusIcon className="mr-2 h-4 w-4" />
        )}
        Tạo
      </Button>
    </>
  );
};
