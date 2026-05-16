import { Link } from "@/i18n/routing";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useTranslations } from "next-intl";

import { VideoGetOneOutput } from "../../types";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
};

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const t = useTranslations("Video");
  const { userId: clerkUserId, isLoaded } = useAuth();
  const { isPending, onClick, updateLevel } = useSubscription({
    userId: user.id,
    isSubscribed: !!user.viewerSubscriptionLevel,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link prefetch href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size="lg" imageUrl={user.imageUrl} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo size="lg" name={user.name} />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {t("subscribers", { count: user.subscriberCount })}
            </span>
          </div>
        </div>
      </Link>
      {clerkUserId === user.clerkId ? (
        <Button
          variant="secondary"
          className="rounded-full"
          asChild
        >
          <Link prefetch href={`/studio/videos/${videoId}`}>
           {t("editVideo")}
          </Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          onUpdateLevel={(level) => updateLevel.mutate({ userId: user.id, level })}
          disabled={isPending || !isLoaded}
          isSubscribed={!!user.viewerSubscriptionLevel}
          level={user.viewerSubscriptionLevel}
          className="flex-none"
        />
      )}
    </div>
  );
};
