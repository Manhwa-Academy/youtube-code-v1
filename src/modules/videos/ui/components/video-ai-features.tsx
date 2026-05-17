"use client";
import React, { useState } from "react";
import { Sparkles, Play, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface VideoAiFeaturesProps {
  aiChapters: string | null;
  aiSummary: string | null;
}

export const VideoAiFeatures = ({ aiChapters, aiSummary }: VideoAiFeaturesProps) => {
  const [isChaptersExpanded, setIsChaptersExpanded] = useState(false);
  const t = useTranslations("Video");

  if (!aiChapters && !aiSummary) return null;

  // Robust parser for chapter timestamps (e.g. 00:00 - Intro, 01:23 - Start, 1:02:43 - End)
  const parseChapters = (text: string) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => {
        const timeMatch = line.match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/);
        if (!timeMatch) return null;

        const fullTimeStr = timeMatch[0];
        const parts = fullTimeStr.split(":").map(Number);
        let seconds = 0;
        if (parts.length === 3) {
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          seconds = parts[0] * 60 + parts[1];
        }

        const afterTime = line.substring(line.indexOf(fullTimeStr) + fullTimeStr.length).trim();
        const title = afterTime.replace(/^[-–—\s:]+/, "").trim();

        return {
          displayTime: fullTimeStr,
          seconds,
          title: title || "Chapter",
        };
      })
      .filter(Boolean) as { displayTime: string; seconds: number; title: string }[];
  };

  const chapters = parseChapters(aiChapters || "");

  const handleSeek = (seconds: number) => {
    // Thẻ Custom Web Component MuxPlayer đóng gói video trong Shadow DOM
    const muxPlayer = document.querySelector("mux-player") as any;
    if (muxPlayer) {
      muxPlayer.currentTime = seconds;
      muxPlayer.play().catch(() => {});
      return;
    }

    // Fallback cho thẻ video thông thường nếu có
    const player = document.querySelector("video");
    if (player) {
      player.currentTime = seconds;
      player.play().catch(() => {});
    }
  };

  return (
    <div className="w-full space-y-4 my-4">
      {/* 🔹 Video AI Summary Card */}
      {aiSummary && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-violet-500/5 to-transparent p-5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md">
          {/* Decorative Sparkle Accent */}
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-rose-500/10 blur-xl" />
          
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
            <h3 className="font-semibold text-sm tracking-wide uppercase text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
              {t("aiSummaryTitle")}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300">
                {t("aiBeta")}
              </span>
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
            {aiSummary}
          </p>
        </div>
      )}

      {/* 🔹 Video AI Chapters (Timestamps) Card */}
      {chapters.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-5 shadow-sm">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsChaptersExpanded(!isChaptersExpanded)}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                <BookOpen className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                  {t("aiChaptersTitle")} ({chapters.length})
                </h3>
                <p className="text-xs text-neutral-500">
                  {t("aiChaptersDesc")}
                </p>
              </div>
            </div>
            <button className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
              {isChaptersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Expandable Chapters List */}
          <div className={cn(
            "grid gap-2 transition-all duration-300 ease-in-out origin-top",
            isChaptersExpanded ? "mt-4 opacity-100 max-h-[500px] overflow-y-auto pr-1" : "opacity-0 max-h-0 overflow-hidden"
          )}>
            {chapters.map((chapter, idx) => (
              <div 
                key={idx}
                onClick={() => handleSeek(chapter.seconds)}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-violet-500/30 hover:bg-violet-500/5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg group-hover:bg-violet-500 group-hover:text-white transition-all duration-200">
                    {chapter.displayTime}
                  </span>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-200">
                    {chapter.title}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 text-violet-500 transition-opacity duration-200">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
