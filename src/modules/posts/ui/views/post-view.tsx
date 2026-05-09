"use client";

import { trpc } from "@/trpc/client";
import { PostCard } from "../components/post-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostViewProps {
  postId: string;
}

export const PostView = ({ postId }: PostViewProps) => {
  const router = useRouter();
  const [post] = trpc.posts.getOne.useSuspenseQuery({ id: postId });

  return (
    <div className="flex flex-col gap-y-4 px-4 pt-6 max-w-[850px] mx-auto w-full mb-10">
      <div className="flex items-center gap-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-6" />
        </Button>
        <h1 className="text-xl font-bold">Bài đăng</h1>
      </div>
      <PostCard post={post} />
    </div>
  );
};
