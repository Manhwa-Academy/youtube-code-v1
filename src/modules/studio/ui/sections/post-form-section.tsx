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
    },
  });

  const onSubmit = (data: z.infer<typeof postUpdateSchema>) => {
    update.mutate(data);
  };

  const fullUrl = `${APP_URL}/posts/${postId}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case "poll":
        return { label: "Cuộc thăm dò ý kiến", icon: BarChart2Icon };
      case "image":
        return { label: "Hình ảnh", icon: ImageIcon };
      default:
        return { label: "Văn bản", icon: TypeIcon };
    }
  };

  const typeInfo = getPostTypeInfo(post.type);
  const TypeIconComponent = typeInfo.icon;

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
                   {post.images.map((img) => (
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
                  <p className="text-xs text-neutral-400 uppercase font-bold mb-4">Bình chọn</p>
                  <div className="space-y-2">
                    {post.poll.options.map((option) => (
                      <div key={option.id} className="p-3 bg-neutral-800 rounded border border-neutral-700 text-sm">
                        {option.text}
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl overflow-hidden">
               <div className="p-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold">Lượt thích</p>
                      <p className="text-xl font-medium">{post.likeCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold">Bình luận</p>
                      <p className="text-xl font-medium">{post.commentCount}</p>
                    </div>
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
