"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import { Separator } from "@/components/ui/separator";

import { UserPageInfo, UserPageInfoSkeleton } from "../components/user-page-info";
import { UserPageBanner, UserPageBannerSkeleton } from "../components/user-page-banner";
import { useTranslations } from "next-intl";

interface UserSectionProps {
  userId: string;
};

export const UserSection = (props: UserSectionProps) => {
  const t = useTranslations("Users");
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<p>{t("errorLoadingUser")}</p>}>
        <UserSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const UserSectionSkeleton = () => {
  return (
    <div className="flex flex-col">
      <UserPageBannerSkeleton />
      <UserPageInfoSkeleton />
      <Separator />
    </div>
  );
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
      <Separator />
    </div>
  );
};

