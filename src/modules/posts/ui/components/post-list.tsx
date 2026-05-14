"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { trpc } from "@/trpc/client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { PostCard } from "./post-card";
import { DEFAULT_LIMIT } from "@/constants";
import { Edit3, Clock, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostListProps {
  userId: string;
}

export const PostList = ({ userId }: PostListProps) => {
  const t = useTranslations("Posts");
  const { user } = useUser();
  const [activeSubTab, setActiveSubTab] = useState<"published" | "scheduled" | "archived">("published");

  const { data: channelUser } = trpc.users.getOne.useQuery({ id: userId });
  const isOwner = user?.id && channelUser?.clerkId === user.id;

  const [posts, query] = trpc.posts.getMany.useSuspenseInfiniteQuery(
    { userId, limit: DEFAULT_LIMIT, status: activeSubTab },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );


  const items = posts.pages.flatMap((page) => page.items);

  const subTabs = [
    { key: "published", label: t("publishedStatus") },
    ...(isOwner ? [
      { key: "scheduled", label: t("scheduledStatus") },
      { key: "archived", label: t("archivedStatus") }
    ] : [])
  ];

  return (
    <div className="flex flex-col gap-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-neutral-800 mb-2">
         {subTabs.map((tab) => (
           <button
             key={tab.key}
             className={cn(
               "pb-3 text-sm font-bold transition-colors relative",
               activeSubTab === tab.key 
                 ? "text-black dark:text-white" 
                 : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
             )}
             onClick={() => setActiveSubTab(tab.key as any)}
           >
              {tab.label}
              {activeSubTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
              )}
           </button>
         ))}
      </div>

      {items.length === 0 ? (
        <>
          {activeSubTab === "published" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-4">
                  <Edit3 className="size-10 text-gray-400" />
               </div>
               <h3 className="text-xl font-bold">{t("publishPostTitle")}</h3>
               <p className="text-sm text-muted-foreground max-w-[400px]">
                  {t("publishPostDesc")}
               </p>
            </div>
          )}

          {activeSubTab === "scheduled" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-4">
                  <Clock className="size-10 text-gray-400" />
               </div>
               <h3 className="text-xl font-bold">{t("schedulePostTitle")}</h3>
               <p className="text-sm text-muted-foreground max-w-[400px]">
                  {t("schedulePostDesc")}
               </p>
            </div>
          )}

          {activeSubTab === "archived" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-4">
                  <Archive className="size-10 text-gray-400" />
               </div>
               <h3 className="text-xl font-bold">{t("archivedPostTitle")}</h3>
               <p className="text-sm text-muted-foreground max-w-[400px]">
                  {t("archivedPostDesc")}
               </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-y-4">
           {items.map((post) => (
             <PostCard key={post.id} post={post} />
           ))}
           <InfiniteScroll
             hasNextPage={query.hasNextPage}
             isFetchingNextPage={query.isFetchingNextPage}
             fetchNextPage={query.fetchNextPage}
           />
        </div>
      )}

    </div>
  );
};
