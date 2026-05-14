"use client";

import { useTranslations } from "next-intl";

import { SubscribedVideosSection } from "../sections/subscribed-videos-section";

export const SubscribedView = () => {
  const t = useTranslations("Sidebar");

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("subscriptions")}</h1>
        <p className="text-xs text-muted-foreground">
          {t("subscriptionsDescription")}
        </p>
      </div>
      <SubscribedVideosSection />
    </div>
  );
};
