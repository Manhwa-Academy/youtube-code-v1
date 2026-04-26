"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface UserTabsProps {
  userId: string;
}

export const UserTabs = ({ userId }: UserTabsProps) => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab"); // lấy ?tab=videos
  const [activeTab, setActiveTab] = useState(tabParam || "home");
  const [activeVideoTab, setActiveVideoTab] = useState<
    "latest" | "popular" | "oldest"
  >("latest");

  useEffect(() => {
    setActiveTab(tabParam || "home");
  }, [tabParam]);

  const tabs = [
    { key: "home", label: "Trang chủ", href: `/user/${userId}` },
    { key: "videos", label: "Video", href: `/user/${userId}?tab=videos` },
    { key: "shorts", label: "Shorts", href: `/user/${userId}?tab=shorts` },
    { key: "posts", label: "Bài đăng", href: `/user/${userId}?tab=posts` },
  ];

  const videoSubTabs: {
    key: "latest" | "popular" | "oldest";
    label: string;
  }[] = [
    { key: "latest", label: "Mới nhất" },
    { key: "popular", label: "Phổ biến" },
    { key: "oldest", label: "Cũ nhất" },
  ];

  return (
    <div>
      {/* Main Tabs */}
      <div className="flex gap-6 border-b border-gray-300 mb-2">
        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={tab.href}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab.key);
              if (tab.key === "videos") setActiveVideoTab("latest"); // reset sub-tab
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Video Sub-Tabs */}
      {activeTab === "videos" && (
        <div className="flex gap-3 mb-4">
          {videoSubTabs.map((sub) => (
            <button
              key={sub.key}
              onClick={() => setActiveVideoTab(sub.key)}
              className={`px-3 py-1 text-sm rounded-full border ${
                activeVideoTab === sub.key
                  ? "bg-black text-white border-black"
                  : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
