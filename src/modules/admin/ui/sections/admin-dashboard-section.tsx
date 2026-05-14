"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  UsersIcon,
  VideoIcon,
  MessageSquareIcon,
  FileTextIcon,
  ClockIcon,
  ActivityIcon,
} from "lucide-react";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export const AdminDashboardSection = () => {
  const t = useTranslations("Admin");

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("systemOverview")}</h1>
       <p className="text-muted-foreground">{t("platformAnalysis")}</p>
      </div>

      <Suspense fallback={<AdminStatsSkeleton />}>
        <ErrorBoundary fallback={<p>{t("errorLoadingStats")}</p>}>
          <AdminStatsSuspense />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

const AdminStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
};

const AdminStatsSuspense = () => {
  const t = useTranslations("Admin");
  const [stats] = trpc.admin.getStats.useSuspenseQuery();

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    return t("hours", { count: hours });
  };

   const statCards = [
    {
      title: t("users"),
      value: stats.totalUsers.toLocaleString(),
      description: t("totalRegisteredAccounts"),
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      title: t("videos"),
      value: stats.totalVideos.toLocaleString(),
      description: t("totalUploadedVideos"),
      icon: VideoIcon,
      color: "text-red-600",
    },
    {
      title: t("comments"),
      value: stats.totalComments.toLocaleString(),
      description: t("totalDiscussions"),
      icon: MessageSquareIcon,
      color: "text-purple-600",
    },
    {
      title: t("posts"),
      value: stats.totalPosts.toLocaleString(),
      description: t("totalCommunityPosts"),
      icon: FileTextIcon,
      color: "text-orange-600",
    },
    {
      title: t("watchTime"),
      value: formatWatchTime(Number(stats.totalWatchTime)),
      description: t("totalVideoWatchTime"),
      icon: ClockIcon,
      color: "text-green-600",
    },
    {
      title: t("activeDAU"),
      value: stats.dau.toLocaleString(),
      description: t("activeUsers24h"),
      icon: ActivityIcon,
      color: "text-cyan-600",
    },
    {
      title: t("activeMAU"),
      value: stats.mau.toLocaleString(),
      description: t("activeUsers30d"),
      icon: ActivityIcon,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
