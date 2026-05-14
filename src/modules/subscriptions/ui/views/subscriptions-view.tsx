"use client";

import { SubscriptionsSection } from "../sections/subscriptions-section";
import { useTranslations } from "next-intl";

export const SubscriptionsView = () => {
  const t = useTranslations("Subscriptions");
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("allSubscriptions")}</h1>
        <p className="text-xs text-muted-foreground">
          {t("manageSubscriptions")}
        </p>
      </div>
      <SubscriptionsSection />
    </div>
  );
};
