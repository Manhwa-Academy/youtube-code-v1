"use client";

import { useTranslations } from "next-intl";
import { HistoryVideosSection } from "../sections/history-videos-section";

export const HistoryView = () => {
  const t = useTranslations("History");

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-xs text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <HistoryVideosSection />
    </div>
  );
};
