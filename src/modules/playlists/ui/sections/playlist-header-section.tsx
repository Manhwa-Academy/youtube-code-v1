"use client";

import { toast } from "sonner";
import { Suspense, useState } from "react";
import { Trash2Icon, Share2, Users, Copy, Check, Plus, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PlaylistHeaderSectionProps {
  playlistId: string;
}

export const PlaylistHeaderSection = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
};

const CollaborateModalContent = ({ playlistId, isOwner }: { playlistId: string; isOwner: boolean }) => {
  const t = useTranslations("Playlists");
  const utils = trpc.useUtils();
  const [handleInput, setHandleInput] = useState("");

  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });
  const { data: collaborators, refetch: refetchCollabs } = trpc.playlists.getCollaborators.useQuery({ playlistId });

  const toggleCollab = trpc.playlists.toggleCollaboration.useMutation({
    onSuccess: () => {
      toast.success(t("updateSuccess"));
      utils.playlists.getOne.invalidate({ id: playlistId });
    },
    onError: () => {
      toast.error(t("updateError"));
    }
  });

  const addCollab = trpc.playlists.addCollaborator.useMutation({
    onSuccess: () => {
      toast.success(t("toastAdded"));
      setHandleInput("");
      refetchCollabs();
    },
    onError: (err) => {
      toast.error(err.message || t("errorOccurred"));
    }
  });

  const removeCollab = trpc.playlists.removeCollaborator.useMutation({
    onSuccess: () => {
      toast.success(t("toastRemoved"));
      refetchCollabs();
    },
    onError: () => {
      toast.error(t("errorOccurred"));
    }
  });

  return (
    <div className="space-y-6 py-4">
      {isOwner && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">{t("collaborationTitle")}</Label>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              {t("collaborationDesc")}
            </p>
          </div>
          <Switch
            checked={playlist.isCollaborative}
            onCheckedChange={(checked) =>
              toggleCollab.mutate({ playlistId, isCollaborative: checked })
            }
            disabled={toggleCollab.isPending}
          />
        </div>
      )}

      {playlist.isCollaborative && (
        <div className="space-y-4">
          {isOwner && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("addCollaborator")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder={t("collaboratorHandlePlaceholder")}
                  className="rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && handleInput.trim()) {
                      addCollab.mutate({ playlistId, handle: handleInput.trim() });
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="rounded-xl shrink-0 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    if (handleInput.trim()) {
                      addCollab.mutate({ playlistId, handle: handleInput.trim() });
                    }
                  }}
                  disabled={addCollab.isPending}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("collaborationTitle")} ({collaborators?.length || 0})
            </Label>
            <div className="max-h-[200px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 pr-1">
              {collaborators?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t("noCollaborators")}
                </p>
              ) : (
                collaborators?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={c.imageUrl}
                        className="size-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        alt={c.name}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-none">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          @{c.handle}
                        </p>
                      </div>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 rounded-xl"
                        onClick={() => removeCollab.mutate({ playlistId, userId: c.id })}
                        disabled={removeCollab.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShareModalContent = ({ playlistId }: { playlistId: string }) => {
  const t = useTranslations("Playlists");
  const params = useParams();
  const locale = params.locale as string || "vi";

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/${locale}/playlists/${playlistId}`;
  const embedCode = `<iframe src="${baseUrl}/${locale}/embed/playlist/${playlistId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;

  const copyToClipboard = async (text: string, type: "link" | "embed") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        toast.success(t("linkCopied"));
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedEmbed(true);
        toast.success(t("embedCopied"));
        setTimeout(() => setCopiedEmbed(false), 2000);
      }
    } catch (err) {
      toast.error(t("errorOccurred"));
    }
  };

  return (
    <div className="space-y-5 py-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("copyLink")}
        </Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={shareUrl}
            className="rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            size="icon"
            variant="outline"
            className="rounded-xl shrink-0"
            onClick={() => copyToClipboard(shareUrl, "link")}
          >
            {copiedLink ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("embedCode")}
        </Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={embedCode}
            className="rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            size="icon"
            variant="outline"
            className="rounded-xl shrink-0"
            onClick={() => copyToClipboard(embedCode, "embed")}
          >
            {copiedEmbed ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  const t = useTranslations("Playlists");
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });
  const { user: clerkUser } = useUser();

  const { data: currentUser } = trpc.users.getCurrent.useQuery(undefined, {
    enabled: !!clerkUser,
  });

  const isOwner = !!currentUser && playlist.userId === currentUser.id;

  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success(t("deleteSuccess"));
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: () => {
      toast.error(t("errorOccurred"));
    },
  });

  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {playlist.name}
          </h1>
          {playlist.isCollaborative && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800 uppercase tracking-wider">
              <Users className="size-3" />
              {t("collaborationTitle")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate sm:ml-2">
          {t("videoFromPlaylist")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Collaborate Button (For Owner, or list viewer if collaborative) */}
        {(isOwner || playlist.isCollaborative) && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 h-9 font-semibold text-xs border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <Users className="size-4" />
                {t("collaborationTitle")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="size-5 text-violet-500" />
                  {t("collaborationTitle")}
                </DialogTitle>
              </DialogHeader>
              <CollaborateModalContent playlistId={playlistId} isOwner={isOwner} />
            </DialogContent>
          </Dialog>
        )}

        {/* Share Button (For everyone!) */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 h-9 font-semibold text-xs border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <Share2 className="size-4" />
              {t("shareTitle")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Share2 className="size-5 text-red-500" />
                {t("shareTitle")}
              </DialogTitle>
            </DialogHeader>
            <ShareModalContent playlistId={playlistId} />
          </DialogContent>
        </Dialog>

        {/* Delete Button (Only for Owner) */}
        {isOwner && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl size-9 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 border-neutral-200 dark:border-neutral-800 shrink-0"
            onClick={() => {
              if (confirm(t("deleteConfirm", { name: playlist.name }))) {
                remove.mutate({ id: playlistId });
              }
            }}
            disabled={remove.isPending}
          >
            <Trash2Icon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

