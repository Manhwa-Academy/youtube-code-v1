"use client";

import { Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { GripVertical } from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";

interface VideosSectionProps {
  playlistId: string;
}

export const VideosSection = (props: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <VideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const VideosSectionSkeleton = () => {
  return (
    <div>
      {/* Mobile / Grid */}
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>

      {/* Desktop / Row */}
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
    </div>
  );
};

interface SortableVideoItemProps {
  video: any;
  playlistId: string;
  onRemove: () => void;
  canEdit: boolean;
}

const SortableVideoItem = ({ video, playlistId, onRemove, canEdit }: SortableVideoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-x-1 group rounded-lg ${
        isDragging ? "bg-accent/40 shadow-md" : ""
      }`}
    >
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <GripVertical className="size-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <VideoRowCard
          data={video}
          size="compact"
          progress={video.progress}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const t = useTranslations("Playlists");
  const utils = trpc.useUtils();
  const { user: clerkUser } = useUser();

  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });
  const { data: currentUser } = trpc.users.getCurrent.useQuery(undefined, {
    enabled: !!clerkUser,
  });
  const { data: collaborators } = trpc.playlists.getCollaborators.useQuery(
    { playlistId },
    { enabled: !!playlist }
  );

  const canEdit =
    !!currentUser &&
    (playlist.userId === currentUser.id ||
      collaborators?.some((c) => c.id === currentUser.id) === true);

  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT, playlistId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // Map progress helper
  const mapVideoWithProgress = (video: any) => ({
    ...video,
    progress: video.progress ?? 0,
  });

  const fetchedVideos = videos.pages.flatMap((page) => page.items);
  const [items, setItems] = useState<any[]>([]);

  // Keep state in sync with paginated query items
  useEffect(() => {
    setItems(fetchedVideos.map(mapVideoWithProgress));
  }, [videos]);

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success(t("toastRemoved"));
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });
    },
    onError: () => {
      toast.error(t("errorOccurred"));
    },
  });

  const reorder = trpc.playlists.reorderVideos.useMutation({
    onSuccess: () => {
      toast.success(t("playlistReordered"));
      utils.playlists.getVideos.invalidate({ playlistId });
    },
    onError: () => {
      toast.error(t("errorReordering"));
      // Rollback optimistic update on error
      setItems(fetchedVideos.map(mapVideoWithProgress));
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(reorderedItems); // Optimistic UI: snap instantly!

      // Trigger mutation
      reorder.mutate({
        playlistId,
        videoIds: reorderedItems.map((item) => item.id),
      });
    }
  };

  return (
    <>
      {/* Mobile / Grid */}
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {items.map((video) => (
          <VideoGridCard
            key={video.id}
            data={video}
            onRemove={
              canEdit
                ? () => removeVideo.mutate({ playlistId, videoId: video.id })
                : undefined
            }
          />
        ))}
      </div>

      {/* Desktop / Row */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="hidden flex-col gap-4 md:flex">
            {items.map((video) => (
              <SortableVideoItem
                key={video.id}
                video={video}
                playlistId={playlistId}
                canEdit={canEdit}
                onRemove={() =>
                  removeVideo.mutate({ playlistId, videoId: video.id })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Infinite scroll */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

