import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { cn, formatDuration } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "../../constants";
import { X, Play, ListMusic, Music, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface VideoPlaylistProps {
  playlist: {
    id: string;
    name: string;
    videos: { 
      id: string; 
      title: string; 
      duration?: number; 
      progress?: number;
      thumbnail?: string | null; 
      thumbnailUrl?: string | null; 
      user?: {
        id: string;
        name: string;
        imageUrl: string;
      };
    }[];
  };
  currentIndex: number;
  currentVideoId?: string;
}

export const VideoPlaylist = ({
  playlist,
  currentIndex,
  currentVideoId = playlist.videos[currentIndex]?.id,
}: VideoPlaylistProps) => {
  const router = useRouter();
  const t = useTranslations("PlaylistPanel");
  const tVideo = useTranslations("Video");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("playlist_collapsed") === "true";
  });

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("playlist_collapsed", nextState.toString());
  };

  const nextVideo = playlist.videos[(currentIndex + 1) % playlist.videos.length];

  return (
    <div 
      onClick={isCollapsed ? handleToggleCollapse : undefined}
      className={cn(
        "w-full bg-neutral-900/90 dark:bg-black/90 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed 
          ? "max-h-[68px] cursor-pointer hover:bg-neutral-800/80 dark:hover:bg-neutral-900/80 hover:scale-[1.01] active:scale-[0.99] group" 
          : "max-h-[480px]"
      )}
    >
      {/* COMPACT VIEW (Visible when collapsed) */}
      <div 
        className={cn(
          "w-full p-4 flex justify-between items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0",
          isCollapsed 
            ? "opacity-100 translate-y-0 h-auto" 
            : "opacity-0 -translate-y-4 h-0 p-0 overflow-hidden pointer-events-none"
        )}
      >
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-medium text-zinc-200 line-clamp-1">
            <span className="text-zinc-400 font-normal">{t("next")}: </span>
            {nextVideo?.title}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1.5 truncate">
            <span>{t("mixPlaylist")} - {playlist.name}</span>
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCollapse();
          }}
          className="p-1.5 bg-neutral-800 group-hover:bg-neutral-700/80 rounded-full text-zinc-300 hover:text-zinc-100 transition-all duration-300 active:scale-90 shrink-0"
          title={t("expandPlaylist")}
        >
          <ChevronDown className="size-4 transition-transform duration-300 group-hover:translate-y-[2px]" />
        </button>
      </div>

      {/* EXPANDED VIEW (Visible when expanded) */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top shrink-0",
          isCollapsed 
            ? "opacity-0 scale-y-95 translate-y-4 h-0 overflow-hidden pointer-events-none" 
            : "opacity-100 scale-y-100 translate-y-0 h-full"
        )}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/80 flex justify-between items-start shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-red-600/10 text-red-500 rounded-md">
                <ListMusic className="size-4" />
              </span>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                {t("mixPlaylist")}
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-100 line-clamp-1">
              {playlist.name}
            </h3>
            <p className="text-xs text-zinc-400">
              {t("mixPlaylistDescription")} • {currentIndex + 1} / {playlist.videos.length}
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCollapse();
            }}
            className="p-1.5 hover:bg-neutral-800/80 rounded-full text-zinc-400 hover:text-zinc-200 transition-all duration-300 active:scale-90"
            title={t("hidePlaylist")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* LIST */}
        <div className="overflow-y-auto max-h-[380px] divide-y divide-zinc-950/50 scrollbar-thin scrollbar-thumb-zinc-800 shrink-0">
          {playlist.videos.map((v, i) => {
            const isCurrent = v.id === currentVideoId || i === currentIndex;
            const duration = v.duration || 0;
            const progress = v.progress || 0; // Đọc trực tiếp tiến trình từ Database (seconds)
            const totalSeconds = duration / 1000;
            const progressPercent = totalSeconds > 0 ? Math.min((progress / totalSeconds) * 100, 100) : 0;

            return (
              <div
                key={`${v.id}-${i}`}
                onClick={() =>
                  router.push(`/videos/${v.id}?list=${playlist.id}&index=${i}`)
                }
                className={cn(
                  "flex gap-3 p-3 cursor-pointer hover:bg-neutral-800/40 text-zinc-300 transition-all items-center",
                  isCurrent && "bg-neutral-800/70 border-l-4 border-red-600 text-white font-medium"
                )}
              >
                {/* Index or Play icon */}
                <div className="w-5 text-center text-xs text-zinc-500 flex justify-center items-center">
                  {isCurrent ? (
                    <Play className="size-3 text-red-500 fill-red-500 animate-pulse" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="relative w-24 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0 border border-neutral-800">
                  <img
                    src={v.thumbnail || v.thumbnailUrl || THUMBNAIL_FALLBACK}
                    className="w-full h-full object-cover"
                    alt={v.title}
                  />
                  
                  {/* Duration Badge */}
                  {duration > 0 && (
                    <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] text-white font-medium z-10 scale-90">
                      {formatDuration(duration)}
                    </div>
                  )}

                  {/* Progress bar */}
                  {progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-700/60 z-10">
                      <div
                        className="h-full bg-red-600 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-[10px] text-zinc-200 bg-red-600/90 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-75">
                        {tVideo("playing")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title / Description */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-xs line-clamp-2 leading-relaxed text-zinc-200",
                    isCurrent && "text-zinc-50"
                  )}>
                    {v.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-1 truncate">
                    {v.user?.name || t("mixPlaylist")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
