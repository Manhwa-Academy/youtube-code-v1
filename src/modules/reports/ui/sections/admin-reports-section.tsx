"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  MoreVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  Trash2Icon,
  ExternalLinkIcon,
  FileXIcon,
} from "lucide-react";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TargetType = "video" | "comment" | "user" | "post" | "all";

export const AdminReportsSection = () => {
  const [currentTab, setCurrentTab] = useState<TargetType>("all");

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý báo cáo vi phạm</h1>
          <p className="text-muted-foreground">Xem xét và kiểm duyệt các nội dung bị báo cáo vi phạm.</p>
        </div>
      </div>

      <div className="mb-6">
        <Tabs 
          value={currentTab} 
          onValueChange={(value) => setCurrentTab(value as TargetType)}
          className="w-full"
        >
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="comment">Bình luận</TabsTrigger>
            <TabsTrigger value="user">Người dùng</TabsTrigger>
            <TabsTrigger value="post">Bài đăng</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Suspense fallback={<AdminReportsSkeleton />} key={currentTab}>
        <ErrorBoundary fallback={<p>Lỗi khi tải danh sách báo cáo</p>}>
          <AdminReportsSuspense targetType={currentTab === "all" ? undefined : currentTab} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

const AdminReportsSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
};

interface AdminReportsSuspenseProps {
  targetType?: "video" | "comment" | "user" | "post";
}

const AdminReportsSuspense = ({ targetType }: AdminReportsSuspenseProps) => {
  const [reportsData] = trpc.reports.getMany.useSuspenseQuery({ 
    limit: 50,
    targetType,
  });
  const utils = trpc.useUtils();

  const updateStatus = trpc.reports.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái");
      utils.reports.getMany.invalidate();
    },
  });

  const deleteTarget = trpc.reports.deleteTarget.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa nội dung vi phạm");
      utils.reports.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeReport = trpc.reports.remove.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa bản ghi báo cáo");
      utils.reports.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'content' | 'record' } | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Đang chờ</Badge>;
      case "reviewed":
        return <Badge variant="outline">Đã xem</Badge>;
      case "resolved":
        return <Badge className="bg-green-500 hover:bg-green-600">Đã xử lý</Badge>;
      case "dismissed":
        return <Badge variant="destructive">Đã bỏ qua</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thao tác?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.type === 'content' 
                ? "Bạn có chắc chắn muốn XÓA nội dung này không? Thao tác này không thể hoàn tác."
                : "Bạn có chắc chắn muốn xóa bản ghi báo cáo này không? (Nội dung gốc sẽ không bị ảnh hưởng)."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className={confirmDelete?.type === 'content' ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => {
                if (confirmDelete?.type === 'content') {
                  deleteTarget.mutate({ id: confirmDelete.id });
                } else if (confirmDelete?.type === 'record') {
                  removeReport.mutate({ id: confirmDelete.id });
                }
                setConfirmDelete(null);
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
              <TableHead className="min-w-[150px]">Ngày tạo</TableHead>
              <TableHead className="min-w-[150px]">Người báo cáo</TableHead>
              <TableHead className="min-w-[100px]">Loại</TableHead>
              <TableHead className="min-w-[200px]">Nội dung bị báo cáo</TableHead>
              <TableHead className="min-w-[150px]">Lý do</TableHead>
              <TableHead className="min-w-[120px]">Trạng thái</TableHead>
              <TableHead className="min-w-[150px] text-center pr-32">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {reportsData.items.map((report) => (
            <TableRow key={report.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
              <TableCell className="text-xs text-muted-foreground font-medium">
                {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{report.user.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{report.user.clerkId.slice(-8)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize text-[10px] font-bold py-0 h-5">
                  {report.targetType === "video" ? "Video" : report.targetType === "comment" ? "Bình luận" : report.targetType === "user" ? "Người dùng" : "Bài đăng"}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <div className="flex flex-col">
                  <span className="font-medium text-sm truncate" title={report.targetName}>
                    {report.targetName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate font-mono">{report.targetId}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{report.reason}</span>
                  {report.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1 italic">
                      "{report.description}"
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell className="text-center pr-32">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem 
                       onClick={() => window.open(
                         report.targetType === 'video' ? `/videos/${report.targetId}` : 
                         report.targetType === 'user' ? `/users/${report.targetId}` : 
                         report.targetType === 'post' ? `/posts/${report.targetId}` : '#',
                         '_blank'
                       )}
                       disabled={report.targetType === 'comment'}
                    >
                      <ExternalLinkIcon className="size-4 mr-2" />
                      Xem nội dung
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => updateStatus.mutate({ id: report.id, status: "reviewed" })}>
                      <CheckCircleIcon className="size-4 mr-2 text-blue-500" />
                      Đánh dấu đã xem
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus.mutate({ id: report.id, status: "dismissed" })}>
                      <XCircleIcon className="size-4 mr-2 text-orange-500" />
                      Bỏ qua
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 font-bold"
                      onClick={() => setConfirmDelete({ id: report.id, type: 'content' })}
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      Xóa nội dung vi phạm
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-muted-foreground"
                      onClick={() => setConfirmDelete({ id: report.id, type: 'record' })}
                    >
                      <FileXIcon className="size-4 mr-2" />
                      Xóa bản ghi báo cáo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {reportsData.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircleIcon className="size-10 text-neutral-200" />
                  <p>Không có báo cáo nào trong mục này.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </div>
    </>
  );
};
