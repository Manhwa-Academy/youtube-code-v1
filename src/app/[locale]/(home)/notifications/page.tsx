import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationsSection } from "@/modules/notifications/ui/sections/notifications-section";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sidebar" });

  return {
    title: t("notifications"),
  };
}

const NotificationsPage = () => {
  return <NotificationsSection />;
};

export default NotificationsPage;
