"use client";

import { useTranslations } from "next-intl";
import { ListFilterIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { StudioPostCommentsSection } from "@/modules/studio/ui/sections/studio-post-comments-section";

interface PostCommentsViewProps {
  postId: string;
}

export const PostCommentsView = ({ postId }: PostCommentsViewProps) => {
  const t = useTranslations("Studio");
  const [sortBy, setSortBy] = useState<"top" | "newest">("newest");

  return (
    <div className="px-4 pt-2.5">
      <div className="flex flex-col gap-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("postComments")}</h1>
        </div>

        <div className="flex flex-col gap-y-4">
           {/* Filters */}
           <div className="flex items-center gap-x-4 border-b border-neutral-800 pb-4">
             <Button variant="outline" size="sm" className="rounded-full bg-neutral-800 border-neutral-700">
               {t("published")}
             </Button>

             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ListFilterIcon className="size-4" />
                    {t("sortBy")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                   <DropdownMenuItem onClick={() => setSortBy("top")}>{t("top")}</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("newest")}>{t("newest")}</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>

             <div className="flex items-center gap-x-2 bg-neutral-800 px-3 py-1 rounded-full text-sm border border-neutral-700">
               <span>{t("responseStatus")}: {t("notResponded")}</span>
               <button className="hover:text-white text-neutral-400">×</button>
             </div>
           </div>

           {/* Comments Section */}
           <StudioPostCommentsSection postId={postId} />
        </div>
      </div>
    </div>
  );
};
