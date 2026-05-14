"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const AnalyticsView = dynamic(
  () => import("@/modules/studio/ui/views/analytics-view").then((mod) => mod.AnalyticsView),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ videoId: string }>;
}

const VideoAnalyticsPage = ({ params }: PageProps) => {
  const { videoId } = use(params);

  return <AnalyticsView videoId={videoId} />;
};

export default VideoAnalyticsPage;
