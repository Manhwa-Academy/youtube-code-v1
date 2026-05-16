import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnalyticsViewClient } from "@/modules/studio/ui/components/analytics-view-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Studio" });

  return {
    title: t("analytics"),
  };
}

const AnalyticsPage = () => {
  return <AnalyticsViewClient />;
};

export default AnalyticsPage;
