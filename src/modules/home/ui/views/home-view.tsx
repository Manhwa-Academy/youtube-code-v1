"use client";

import { useEffect } from "react";
import { useIsOnline } from "@/hooks/use-is-online";
import { CategoriesSection } from "../sections/categories-section";
import { HomeVideosSection } from "../sections/home-videos-section";
import { HomeShortsSection } from "../sections/home-shorts-section";
import { OfflineHomeSection } from "../sections/offline-home-section";
import { PlaylistsView } from "@/modules/playlists/ui/sections/playlists-view";

interface HomeViewProps {
  categoryId?: string;
};

export const HomeView = ({ categoryId }: HomeViewProps) => {
  const isOnline = useIsOnline();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("shorts_nav_depth", "0");
    }
  }, []);

  if (!isOnline) {
    return (
      <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-4 flex flex-col gap-y-6">
        <OfflineHomeSection />
      </div>
    );
  }

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      
      <CategoriesSection categoryId={categoryId} />

      {/* 🔥 Playlists kết hợp */}
      <PlaylistsView />

      {/* 🎬 Shorts shelf */}
      <HomeShortsSection categoryId={categoryId} />

      <HomeVideosSection categoryId={categoryId} />

    </div>
  );
};
