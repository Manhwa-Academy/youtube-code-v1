"use client";

import { useEffect } from "react";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

import { useTranslations } from "next-intl";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const t = useTranslations("Common");
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isManual, fetchNextPage]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant="secondary"
          className="rounded-full bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/20 text-black dark:text-white font-bold px-6"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("loading")}
            </>
          ) : t("viewMore")}
        </Button>
      ) : null}
    </div>
  );
};
