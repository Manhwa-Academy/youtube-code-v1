"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { VideosSection } from "../sections/videos-section";
import { PlaylistsSection } from "../sections/playlists-section";
import { PostsSection } from "../sections/posts-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const StudioView = () => {
  return (
    <Suspense>
      <StudioViewSuspense />
    </Suspense>
  );
};

const StudioViewSuspense = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "videos";
  
  const [limit, setLimit] = useState(30);

  const onTabChange = (value: string) => {
    router.push(`/studio?tab=${value}`, { scroll: false });
  };

  return ( 
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nội dung của kênh</h1>
          <p className="text-xs text-muted-foreground">
            Quản lý video, shorts, danh sách phát và bài đăng trên kênh của bạn
          </p>
        </div>
      </div>

      <Tabs value={tab} className="w-full" onValueChange={onTabChange}>
        <div className="px-4 border-b">
          <TabsList className="bg-transparent h-auto p-0 gap-x-8">
            <TabsTrigger 
              value="videos" 
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent data-[state=active]:bg-transparent font-medium"
            >
              Video
            </TabsTrigger>
            <TabsTrigger 
              value="shorts"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent data-[state=active]:bg-transparent font-medium"
            >
              Shorts
            </TabsTrigger>
            <TabsTrigger 
              value="playlists"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent data-[state=active]:bg-transparent font-medium"
            >
              Danh sách phát
            </TabsTrigger>
            <TabsTrigger 
              value="posts"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent data-[state=active]:bg-transparent font-medium"
            >
              Bài đăng
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="videos" className="mt-0 outline-none">
          <VideosSection limit={limit} />
        </TabsContent>
        <TabsContent value="shorts" className="mt-0 outline-none">
          <VideosSection limit={limit} isShorts />
        </TabsContent>
        <TabsContent value="playlists" className="mt-0 outline-none">
          <PlaylistsSection limit={limit} />
        </TabsContent>
        <TabsContent value="posts" className="mt-0 outline-none">
          <PostsSection limit={limit} />
        </TabsContent>

        <div className="px-4 py-4 border-t flex items-center justify-end gap-x-2 text-sm text-muted-foreground">
          <span>Số hàng mỗi trang:</span>
          <Select value={limit.toString()} onValueChange={(val) => setLimit(Number(val))}>
            <SelectTrigger className="w-[70px] h-8 border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Tabs>
    </div>
  );
}

