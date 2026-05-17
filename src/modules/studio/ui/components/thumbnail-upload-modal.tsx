"use client";

import { useState, useRef, DragEvent } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Loader2Icon, UploadIcon, ImageIcon, AlertCircleIcon } from "lucide-react";

import { trpc } from "@/trpc/client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThumbnailUpdate?: (url: string) => void;
  endpoint?: "thumbnailUploader" | "thumbnailBUploader";
}

export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
  onThumbnailUpdate,
  endpoint = "thumbnailUploader",
}: ThumbnailUploadModalProps) => {
  const t = useTranslations("Studio");
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // tRPC Mutation cập nhật video
  const update = trpc.videos.update.useMutation({
    onSuccess: (data) => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      
      const newUrl = endpoint === "thumbnailBUploader" ? data.thumbnailBUrl : data.thumbnailUrl;
      if (newUrl) {
        onThumbnailUpdate?.(newUrl);
      }
      
      toast.success(t("success"));
      setIsUploading(false);
      setUploadProgress(0);
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t("error"));
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  // Thực hiện tải ảnh trực tiếp lên Cloudinary
  const uploadToCloudinary = async (file: File) => {
    // Kiểm tra định dạng file
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, WEBP).");
      return;
    }

    // Giới hạn kích thước file 4MB
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Kích thước tệp tin không được vượt quá 4MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dijtgbgwb";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      setUploadProgress(30);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      if (!res.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const data = await res.json();
      const imageUrl = data.secure_url;
      const imageKey = data.public_id;

      if (!imageUrl || !imageKey) {
        throw new Error("Invalid response from Cloudinary");
      }

      setUploadProgress(90);

      // Gọi API cập nhật thông tin trong database
      if (endpoint === "thumbnailBUploader") {
        update.mutate({
          id: videoId,
          thumbnailBUrl: imageUrl,
          thumbnailBKey: imageKey,
          thumbnailAViews: 0,
          thumbnailBViews: 0,
          thumbnailAClicks: 0,
          thumbnailBClicks: 0,
        });
      } else {
        update.mutate({
          id: videoId,
          thumbnailUrl: imageUrl,
          thumbnailKey: imageKey,
        });
      }

    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast.error("Có lỗi xảy ra khi tải ảnh lên Cloudinary. Vui lòng thử lại.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Trình xử lý kéo thả file
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  return (
    <ResponsiveModal
      title={t("uploadThumbnail")}
      open={open}
      onOpenChange={(newOpen) => {
        if (!isUploading) onOpenChange(newOpen);
      }}
    >
      <div className="p-5">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[220px] ${
            isDragging
              ? "border-violet-500 bg-violet-500/5 shadow-md shadow-violet-500/5"
              : "border-neutral-300 dark:border-neutral-800 hover:border-violet-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/30"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-[240px]">
              <Loader2Icon className="h-10 w-10 text-violet-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Đang tải lên Cloudinary...
                </p>
                <p className="text-xs text-neutral-500 mt-1">Vui lòng không đóng cửa sổ này</p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
                <UploadIcon className="h-6 w-6 animate-bounce" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Kéo và thả ảnh của bạn vào đây
                </p>
                <p className="text-xs text-neutral-500 mt-1">hoặc click để chọn từ thiết bị</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-semibold bg-neutral-100 dark:bg-neutral-900/50 px-2.5 py-1 rounded-full">
                <ImageIcon className="h-3 w-3" />
                <span>Hỗ trợ PNG, JPG, WEBP (Tối đa 4MB)</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-neutral-500 dark:text-neutral-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
          <AlertCircleIcon className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="leading-normal">
            Ảnh thu nhỏ sẽ được lưu trực tiếp vào không gian Cloudinary bảo mật của bạn và tự động tối ưu hóa hiển thị.
          </p>
        </div>
      </div>
    </ResponsiveModal>
  );
};