"use client";

import { useTranslations } from "next-intl";
import { ClipsSection } from "../sections/clips-section";

export const ClipsView = () => {
  const t = useTranslations("Clips");

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">{t("title")}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t("description")}
        </p>
      </div>
      <ClipsSection />
    </div>
  );
};
