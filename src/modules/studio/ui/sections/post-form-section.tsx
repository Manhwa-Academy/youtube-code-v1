"use client";

import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  BarChart2Icon,
  ImageIcon,
  TypeIcon,
  PencilIcon,
  MessageSquareIcon,
  TrashIcon,
  CheckCircle2Icon,
} from "lucide-react";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { postUpdateSchema } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_URL } from "@/constants";

interface PostFormSectionProps {
  postId: string;
}

export const PostFormSection = ({ postId }: PostFormSectionProps) => {
  return (
    <Suspense fallback={<PostFormSectionSkeleton />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PostFormSectionSuspense postId={postId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const PostFormSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-6 lg:col-span-3">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
};

const PostFormSectionSuspense = ({ postId }: PostFormSectionProps) => {
  const t = useTranslations("Studio");
  const router = useRouter();
  const utils = trpc.useUtils();

  const [post] = trpc.studio.getPost.useSuspenseQuery({ id: postId });

  const update = trpc.posts.update.useMutation({
    onSuccess: () => {
      utils.studio.getPost.invalidate({ id: postId });
      toast.success("Đã cập nhật bài đăng");
    },
    onError: () => {
      toast.error("Cập nhật thất bại");
    },
  });

  const remove = trpc.posts.remove.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa bài đăng");
      router.push("/studio");
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });

  const form = useForm<z.infer<typeof postUpdateSchema>>({
    resolver: zodResolver(postUpdateSchema),
    defaultValues: {
       id: post.id,
       content: post.content || "",
       canComment: post.canComment,
       commentModeration: post.commentModeration,
    },
  });

  const onSubmit = (values: z.infer<typeof postUpdateSchema>) => {
    if (values.id) {
      update.mutate({ 
        id: values.id,
        content: values.content,
        canComment: values.canComment,
        commentModeration: values.commentModeration,
      });
    }
  };

  const fullUrl = `${APP_URL}/posts/${postId}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isQuiz = post.poll?.options.some((opt: any) => opt.isCorrect);

  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case "poll":
        return { 
          label: isQuiz ? "Câu hỏi" : "Cuộc thăm dò ý kiến", 
          icon: isQuiz ? CheckCircle2Icon : BarChart2Icon 
        };
      case "image":
        return { label: "Hình ảnh", icon: ImageIcon };
      default:
        return { label: "Văn bản", icon: TypeIcon };
    }
  };

  const typeInfo = getPostTypeInfo(post.type);
  const TypeIconComponent = typeInfo.icon;

  const totalVotes = post.poll?.options.reduce((acc: number, o: any) => acc + (o.voteCount || 0), 0) || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chi tiết về bài đăng</h1>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => form.reset()}
              disabled={!form.formState.isDirty || update.isPending}
            >
              Huỷ thay đổi
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!form.formState.isDirty || update.isPending}
            >
              Lưu
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => remove.mutate({ id: postId })}
                  className="text-red-500 focus:text-red-500"
                >
                  <TrashIcon className="size-4 mr-2" />
                  Xóa bài đăng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-3">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="border border-neutral-700 rounded-md p-4 bg-neutral-900/50">
                    <FormLabel className="text-xs text-neutral-400 uppercase font-bold mb-2 block">
                      Văn bản (bắt buộc)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={6}
                        className="bg-transparent border-none focus-visible:ring-0 p-0 resize-none"
                        placeholder="Nội dung bài đăng của bạn"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {post.images && post.images.length > 0 && (
              <div className="border border-neutral-700 rounded-md p-4 bg-neutral-900/50">
                <p className="text-xs text-neutral-400 uppercase font-bold mb-4">Hình ảnh</p>
                <div className="grid grid-cols-1 gap-4">
                   {post.images.map((img: { id: string; imageUrl: string }) => (
                     <div key={img.id} className="relative aspect-square max-w-[400px] border border-neutral-800 rounded-md overflow-hidden">
                        <Image 
                          src={img.imageUrl} 
                          alt="Post image" 
                          fill 
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                          1/1
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {post.type === "poll" && post.poll && (
               <div className="border border-neutral-700 rounded-md p-4 bg-neutral-900/50">
                  <p className="text-xs text-neutral-400 uppercase font-bold mb-1">
                    {isQuiz ? "Kết quả đố vui" : "Kết quả cuộc thăm dò ý kiến"}
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    {isQuiz 
                      ? `Câu đố vui này nhận được ${totalVotes} câu trả lời` 
                      : `Cuộc thăm dò ý kiến này có ${totalVotes} lượt bình chọn`}
                  </p>
                  <div className="space-y-2">
                    {post.poll.options.map((option: { id: string; text: string | null; imageUrl?: string | null; isCorrect: boolean; voteCount: number }) => {
                      const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
                      return (
                        <div key={option.id} className="flex items-center gap-3 p-2 bg-neutral-800 rounded border border-neutral-700 hover:bg-neutral-700/50 transition-colors">
                          {option.imageUrl && (
                            <div className="relative size-12 flex-shrink-0 rounded overflow-hidden border border-neutral-600">
                              <Image 
                                src={option.imageUrl}
                                alt={option.text ?? ""}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 font-medium text-sm">
                            {option.text}
                          </div>
                          <div className="text-xs text-neutral-400 font-bold pr-2 flex items-center gap-2">
                            {isQuiz && option.isCorrect && <CheckCircle2Icon className="size-4 text-green-500" />}
                            {percentage}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            )}

            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold">Bình luận và thông tin đánh giá</h2>
                <p className="text-xs text-neutral-400">Chọn xem bạn muốn hiển thị hay ẩn phần bình luận và chọn cách hiển thị.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="canComment"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative group border border-neutral-700 focus-within:border-blue-500 rounded-md px-3 py-1.5 transition-colors bg-neutral-900/50">
                        <FormLabel className="text-[10px] text-neutral-400 group-focus-within:text-blue-500 uppercase font-bold">
                          Bình luận
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                        >
                          <FormControl>
                            <SelectTrigger className="border-none focus:ring-0 p-0 h-auto text-sm bg-transparent">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Bật</SelectItem>
                            <SelectItem value="false">Tắt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commentModeration"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative group border border-neutral-700 focus-within:border-blue-500 rounded-md px-3 py-1.5 transition-colors bg-neutral-900/50">
                        <FormLabel className="text-[10px] text-neutral-400 group-focus-within:text-blue-500 uppercase font-bold">
                          Kiểm duyệt
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={(field.value as string) || "none"}
                        >
                          <FormControl>
                            <SelectTrigger className="border-none focus:ring-0 p-0 h-auto text-sm bg-transparent">
                              <SelectValue placeholder="Chọn mức độ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Không</SelectItem>
                            <SelectItem value="basic">Cơ bản</SelectItem>
                            <SelectItem value="strict">Nghiêm ngặt</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl overflow-hidden">
               <div className="p-4 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold text-nowrap">Lượt thích</p>
                      <p className="text-xl font-medium">{post.likeCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold text-nowrap">Bình luận</p>
                      <p className="text-xl font-medium">{post.commentCount}</p>
                    </div>
                    {post.type === "poll" && (
                      <div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold text-nowrap">
                          {isQuiz ? "Câu trả lời" : "Số phiếu"}
                        </p>
                        <p className="text-xl font-medium">{totalVotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Loại</p>
                    <div className="flex items-center gap-x-2">
                      <TypeIconComponent className="size-4 text-neutral-400" />
                      <span className="text-sm">{typeInfo.label}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Đường liên kết</p>
                    <div className="flex items-center gap-x-2 group/link">
                      <Link href={`/posts/${postId}`} className="text-sm text-blue-500 truncate hover:underline">
                        {fullUrl}
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={onCopy}
                      >
                        {isCopied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                      </Button>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-4 space-y-1">
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Chế độ hiển thị</p>
              <div className="flex items-center gap-x-2">
                <Globe2Icon className="size-4 text-neutral-400" />
                <span className="text-sm">Công khai</span>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-4 space-y-1">
              <p className="text-[10px] text-neutral-400 uppercase font-bold">Hạn chế</p>
              <p className="text-sm text-neutral-400">Không có</p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
