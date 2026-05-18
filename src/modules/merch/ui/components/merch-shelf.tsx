"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

interface MerchShelfProps {
  uploaderId: string;
}

export const MerchShelf = ({ uploaderId }: MerchShelfProps) => {
  const t = useTranslations("Merch");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = trpc.merch.getManyByCreator.useQuery({
    userId: uploaderId,
  });

  if (isLoading) {
    return (
      <div className="mt-6 p-6 rounded-3xl bg-neutral-900/10 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 animate-pulse">
        <div className="h-6 w-48 bg-neutral-300 dark:bg-neutral-800 rounded-full mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[180px] shrink-0 aspect-[3/4] bg-neutral-200 dark:bg-neutral-850 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="relative mt-6 p-6 rounded-3xl bg-gradient-to-br from-violet-500/5 via-fuchsia-500/2 to-transparent border border-violet-500/10 dark:border-violet-500/20 shadow-sm overflow-hidden group">
      {/* 🌟 Background decorative glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400">
            <ShoppingBag className="size-5" />
          </div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            {t("title")}
          </h3>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 font-medium">
            {products.length}
          </span>
        </div>

        {/* Carousel buttons */}
        {products.length > 4 && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              onClick={scrollLeft}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              onClick={scrollRight}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Products Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <a
            key={product.id}
            href={product.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[180px] shrink-0 p-3 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/80 hover:border-violet-500/30 hover:shadow-md transition-all duration-300 flex flex-col gap-2.5 group/card"
          >
            {/* Image Container with Zoom effect */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
              />
              <div className="absolute top-2 right-2 size-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <ExternalLink className="size-3.5" />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 justify-between gap-1.5">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-xs font-bold line-clamp-2 text-neutral-800 dark:text-neutral-200 group-hover/card:text-violet-500 transition-colors duration-300">
                  {product.title}
                </h4>
              </div>
              <div className="flex items-center justify-between gap-1 mt-auto">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/10">
                  {product.price}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-0.5 group-hover/card:text-fuchsia-500 transition-colors duration-300">
                  {t("buyNow")}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
