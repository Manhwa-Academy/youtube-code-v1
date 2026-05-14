"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslations } from "next-intl";
import { PostEditor } from "../components/post-editor";
import { PostList } from "../components/post-list";

interface PostsSectionProps {
  userId: string;
}

export const PostsSection = ({ userId }: PostsSectionProps) => {
  const t = useTranslations("Posts");
  return (
    <div className="flex flex-col gap-y-6 max-w-[850px] mx-auto w-full">
      <PostEditor userId={userId} />
      <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl" />)}</div>}>
        <ErrorBoundary fallback={<p>{t("errorLoadingPosts")}</p>}>
          <PostList userId={userId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};
