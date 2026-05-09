"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  MessageSquareIcon,
  TypeIcon,
  ImageIcon,
  BarChart2Icon,
  ExternalLinkIcon
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export const PostDetailsSidebar = () => {
  const pathname = usePathname();
  const postId = pathname.split("/studio/posts/")[1]?.split("/")[0];
  
  const { data: post, isLoading } = trpc.studio.getPost.useQuery(
    { id: postId },
    { enabled: !!postId }
  );

  if (isLoading || !post) {
    return (
      <SidebarGroup>
        <div className="px-2 py-4 space-y-4">
           <Skeleton className="h-4 w-32" />
           <Skeleton className="aspect-video w-full rounded-md" />
           <div className="space-y-2">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-2/3" />
           </div>
        </div>
      </SidebarGroup>
    );
  }

  const isCommentsPage = pathname.includes("/comments");

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "poll": return BarChart2Icon;
      case "image": return ImageIcon;
      default: return TypeIcon;
    }
  };

  const Icon = getPostTypeIcon(post.type);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/studio?tab=posts">
              <ArrowLeftIcon className="size-5" />
              <span className="text-sm">Nội dung của kênh</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <div className="px-2 py-4">
          <div className="relative aspect-video bg-neutral-800 rounded-md flex items-center justify-center border border-neutral-700 overflow-hidden mb-2 group/thumbnail">
            {post.images && post.images.length > 0 ? (
              <img 
                src={post.images[0].imageUrl} 
                alt="Post" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon className="size-8 text-neutral-500" />
            )}
            <Link 
              href={`/posts/${postId}`} 
              target="_blank"
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity gap-y-1"
            >
              <ExternalLinkIcon className="size-5 text-white" />
              <span className="text-[10px] text-white font-medium px-2 py-0.5 bg-black/40 rounded-sm">
                Xem bài đăng trên YouTube
              </span>
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-neutral-400 font-medium">Bài đăng của bạn</p>
            <p className="text-sm font-bold line-clamp-2">{post.content || "Không có nội dung"}</p>
          </div>
        </div>

        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={!isCommentsPage} 
            asChild
            tooltip="Chi tiết"
          >
            <Link href={`/studio/posts/${postId}`}>
              <PencilIcon className="size-5" />
              <span className="text-sm">Chi tiết</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={isCommentsPage} 
            asChild
            tooltip="Bình luận"
          >
            <Link href={`/studio/posts/${postId}/comments`}>
              <MessageSquareIcon className="size-5" />
              <span className="text-sm">Bình luận</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};
