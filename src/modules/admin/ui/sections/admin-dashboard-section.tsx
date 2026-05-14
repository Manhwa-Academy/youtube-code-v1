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

export const AdminDashboardSection = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
       <p className="text-muted-foreground">Phân tích nền tảng và tình trạng hệ thống.</p>
      </div>

      <Suspense fallback={<AdminStatsSkeleton />}>
        <ErrorBoundary fallback={<p>Lỗi khi tải thông số hệ thống</p>}>
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
  const [stats] = trpc.admin.getStats.useSuspenseQuery();

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    return `${hours.toLocaleString()} giờ`;
  };

  const statCards = [
    {
      title: "Người dùng",
      value: stats.totalUsers.toLocaleString(),
      description: "Tổng số tài khoản đã đăng ký",
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      title: "Video",
      value: stats.totalVideos.toLocaleString(),
      description: "Tổng số video đã tải lên",
      icon: VideoIcon,
      color: "text-red-600",
    },
    {
      title: "Bình luận",
      value: stats.totalComments.toLocaleString(),
      description: "Tổng số thảo luận",
      icon: MessageSquareIcon,
      color: "text-purple-600",
    },
    {
      title: "Bài đăng",
      value: stats.totalPosts.toLocaleString(),
      description: "Tổng số bài đăng cộng đồng",
      icon: FileTextIcon,
      color: "text-orange-600",
    },
    {
      title: "Thời gian xem",
      value: formatWatchTime(Number(stats.totalWatchTime)),
      description: "Tổng thời gian xem video",
      icon: ClockIcon,
      color: "text-green-600",
    },
    {
      title: "Hoạt động (DAU)",
      value: stats.dau.toLocaleString(),
      description: "Người dùng hoạt động trong 24h",
      icon: ActivityIcon,
      color: "text-cyan-600",
    },
    {
      title: "Hoạt động (MAU)",
      value: stats.mau.toLocaleString(),
      description: "Người dùng hoạt động trong 30 ngày",
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
