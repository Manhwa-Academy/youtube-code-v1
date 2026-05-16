import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";

const AnalyticsView = dynamic(
  () => import("@/modules/studio/ui/views/analytics-view").then((mod) => mod.AnalyticsView),
  { ssr: false }
);

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
  return <AnalyticsView />;
};

export default AnalyticsPage;
