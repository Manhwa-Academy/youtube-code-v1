"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, Play, Pause, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const StoriesShelf = () => {
  const t = useTranslations("Stories");
  const utils = trpc.useUtils();
  const { user: clerkUser } = useUser();

  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states for creating a new story
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("uploadLimit"));
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(t("uploading"));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dijtgbgwb";
      const resourceType = isVideo ? "video" : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const secureUrl = data.secure_url;

      if (!secureUrl) {
        throw new Error("No secure URL returned");
      }

      setMediaUrl(secureUrl);
      setMediaType(isVideo ? "video" : "image");
      toast.success(t("uploadSuccess"), { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(t("uploadError"), { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const { data: groups, isLoading } = trpc.stories.getActiveGroups.useQuery();
  const { data: dbUser } = trpc.users.getCurrent.useQuery(undefined, { enabled: !!clerkUser });

  const createStory = trpc.stories.create.useMutation({
    onSuccess: () => {
      toast.success(t("success"));
      setIsCreateOpen(false);
      setMediaUrl("");
      setCaption("");
      utils.stories.getActiveGroups.invalidate();
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;
    createStory.mutate({
      mediaUrl,
      mediaType,
      caption: caption.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 p-2 overflow-x-auto no-scrollbar py-4 border-b border-neutral-100 dark:border-neutral-800 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="size-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const currentUserDb = dbUser || null;

  const userStoryGroup = groups?.find((g: any) => g.user.id === currentUserDb?.id);

  return (
    <div className="relative p-1 overflow-x-auto no-scrollbar py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center gap-4 scroll-smooth">
      {/* 1. '+' Your Story Bubble */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 group">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="relative size-16 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-violet-500/50 hover:shadow-md flex items-center justify-center transition-all duration-300">
              {currentUserDb ? (
                <div className="relative size-14 rounded-full overflow-hidden">
                  <UserAvatar name={currentUserDb.name} imageUrl={currentUserDb.imageUrl} size="sm" className="size-full" />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/10 transition-colors duration-300">
                    <Plus className="size-5 text-white" />
                  </div>
                </div>
              ) : (
                <Plus className="size-6 text-neutral-500" />
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1.5">
                <Sparkles className="size-5 text-violet-500" />
                {t("createStory")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="mediaUrl">{t("uploadMedia")} (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="mediaUrl"
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    required
                    disabled={isUploading}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="shrink-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 hover:from-violet-500/20 hover:to-fuchsia-500/20 border-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="size-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        ...
                      </span>
                    ) : (
                      t("uploadFile")
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t("uploadTip")}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>{t("storyType")}</Label>
                <RadioGroup
                  value={mediaType}
                  onValueChange={(val: any) => setMediaType(val)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="r-image" />
                    <Label htmlFor="r-image" className="flex items-center gap-1 cursor-pointer">
                      <ImageIcon className="size-4 text-muted-foreground" />
                      {t("image")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="r-video" />
                    <Label htmlFor="r-video" className="flex items-center gap-1 cursor-pointer">
                      <VideoIcon className="size-4 text-muted-foreground" />
                      {t("video")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="caption">{t("caption")}</Label>
                <Input
                  id="caption"
                  placeholder={t("captionPlaceholder")}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <p className="text-[10px] text-muted-foreground">
                {t("expiresIn24h")}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} type="button">
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createStory.isPending || !mediaUrl.trim()}
                  className="bg-violet-600 hover:bg-violet-750 text-white rounded-full px-5"
                >
                  {createStory.isPending ? t("uploading") : t("createStory")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-violet-500 transition-colors duration-300">
          {t("yourStory")}
        </span>
      </div>

      {/* 2. Active Stories Carousel */}
      {groups?.map((group: any, gIndex: number) => {
        const hasUnread = true; // For demonstration, unread story styling
        return (
          <div key={group.user.id} className="flex flex-col items-center gap-1.5 shrink-0 group/avatar">
            <button
              onClick={() => {
                setActiveGroupIndex(gIndex);
                setActiveStoryIndex(0);
              }}
              className="relative size-16 p-0.5 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 shrink-0"
            >
              {/* Spinning / Glowing Gradient Ring for Unread stories */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 animate-spin duration-10000 opacity-100" />
              <div className="relative size-14 rounded-full p-0.5 bg-white dark:bg-black z-10">
                <UserAvatar name={group.user.name} imageUrl={group.user.imageUrl} size="sm" className="size-full hover:brightness-90" />
              </div>
            </button>
            <span className="text-[11px] font-bold max-w-[70px] truncate text-neutral-700 dark:text-neutral-300 group-hover/avatar:text-violet-500 transition-colors duration-300">
              {group.user.name}
            </span>
          </div>
        );
      })}

      {/* 3. Immersive Story Player Modal */}
      {activeGroupIndex !== null && groups && (
        <StoryViewerModal
          groups={groups}
          activeGroupIndex={activeGroupIndex}
          activeStoryIndex={activeStoryIndex}
          setActiveGroupIndex={setActiveGroupIndex}
          setActiveStoryIndex={setActiveStoryIndex}
        />
      )}
    </div>
  );
};

/* Fullscreen Immersive Player Component */
interface StoryViewerModalProps {
  groups: any[];
  activeGroupIndex: number;
  activeStoryIndex: number;
  setActiveGroupIndex: (idx: number | null) => void;
  setActiveStoryIndex: (idx: number) => void;
}

const StoryViewerModal = ({
  groups,
  activeGroupIndex,
  activeStoryIndex,
  setActiveGroupIndex,
  setActiveStoryIndex,
}: StoryViewerModalProps) => {
  const t = useTranslations("Stories");
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);
  const progressRef = useRef(0);

  const group = groups[activeGroupIndex];
  const story = group.stories[activeStoryIndex];

  const duration = 5000; // 5 seconds per story

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [activeGroupIndex, activeStoryIndex]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 50; // Update every 50ms
    timerRef.current = setInterval(() => {
      progressRef.current += (interval / duration) * 100;
      
      if (progressRef.current >= 100) {
        clearInterval(timerRef.current);
        setProgress(100);
        handleNext();
      } else {
        setProgress(progressRef.current);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeGroupIndex, activeStoryIndex]);

  const handleNext = () => {
    if (activeStoryIndex < group.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else if (activeGroupIndex < groups.length - 1) {
      setActiveGroupIndex(activeGroupIndex + 1);
      setActiveStoryIndex(0);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else if (activeGroupIndex > 0) {
      const prevGroup = groups[activeGroupIndex - 1];
      setActiveGroupIndex(activeGroupIndex - 1);
      setActiveStoryIndex(prevGroup.stories.length - 1);
    }
  };

  const handleClose = () => {
    setActiveGroupIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-300">
      {/* Blurred Backdrop of current story */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-110 pointer-events-none transition-all duration-500" 
        style={{ backgroundImage: `url(${story.mediaUrl})` }}
      />

      <div className="relative w-full max-w-[450px] aspect-[9/16] h-[92vh] max-h-[820px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col z-10">
        {/* Progress Bars (Instagram style) */}
        <div className="absolute top-3 left-4 right-4 flex gap-1.5 z-50">
          {group.stories.map((s: any, idx: number) => (
            <div key={s.id} className="h-[3px] flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: idx < activeStoryIndex ? "100%" : idx === activeStoryIndex ? `${progress}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header info */}
        <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <UserAvatar name={group.user.name} imageUrl={group.user.imageUrl} size="sm" className="border border-white/20" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white shadow-sm leading-none">{group.user.name}</span>
              <span className="text-[9px] text-white/70 shadow-sm mt-0.5">
                {story.mediaType === "video" ? "Video Reel" : "Story"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className="text-white hover:text-neutral-200 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button 
              onClick={handleClose} 
              className="text-white hover:text-neutral-200 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div 
          className="flex-1 w-full relative flex items-center justify-center bg-black cursor-pointer"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Left/Right click trigger overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 z-40" onClick={(e) => { e.stopPropagation(); handleNext(); }} />

          {story.mediaType === "video" ? (
            <video 
              src={story.mediaUrl}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={story.mediaUrl} 
              alt={story.caption || ""} 
              className="w-full h-full object-contain"
            />
          )}

          {/* Caption Overlay */}
          {story.caption && (
            <div className="absolute bottom-12 left-4 right-4 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 z-40">
              <p className="text-xs font-medium text-white text-center leading-relaxed">
                {story.caption}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Sidebar arrows (Desktop view) */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handlePrev} 
            className="size-11 rounded-full text-white bg-black/40 hover:bg-black/60 hover:text-white"
          >
            <ChevronLeft className="size-6" />
          </Button>
        </div>
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden md:block">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNext} 
            className="size-11 rounded-full text-white bg-black/40 hover:bg-black/60 hover:text-white"
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
