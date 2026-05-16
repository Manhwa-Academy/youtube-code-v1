"use client";

import { useState } from "react";

import { useTranslations, useLocale } from "next-intl";
import { format, subDays, isSameMonth } from "date-fns";
import { enUS, vi, ja, ko, zhCN, de, es, fr } from "date-fns/locale";

import { trpc } from "@/trpc/client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/i18n/routing";
import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchX } from "lucide-react";

const dateFnsLocales = {
  en: enUS,
  vi: vi,
  ja: ja,
  ko: ko,
  zh: zhCN,
  de: de,
  es: es,
  fr: fr,
};

interface SubscribersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscribersModal = ({
  open,
  onOpenChange,
}: SubscribersModalProps) => {
  const t = useTranslations("Studio");
  const p = useTranslations("Video");
  const locale = useLocale();
  const dateLocale = dateFnsLocales[locale as keyof typeof dateFnsLocales] || enUS;

  const [days, setDays] = useState<number | undefined>(undefined);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.studio.getRecentSubscribers.useInfiniteQuery(
    { limit: 10, days },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const utils = trpc.useUtils();
  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      utils.studio.getRecentSubscribers.invalidate({ days });
    },
  });
  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      utils.studio.getRecentSubscribers.invalidate({ days });
    },
  });

  const onToggleSubscription = (userId: string, isSubscribed: boolean) => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  const getDateRange = () => {
    if (!days) return null;
    const end = new Date();
    const start = subDays(end, days);

    if (isSameMonth(start, end)) {
      return `${format(start, "d", { locale: dateLocale })} - ${format(end, "d MMM, yyyy", { locale: dateLocale })}`;
    }

    return `${format(start, "d MMM", { locale: dateLocale })} - ${format(end, "d MMM, yyyy", { locale: dateLocale })}`;
  };

  return (
    <ResponsiveModal
      title={t("recentSubscribers")}
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-4xl"
    >
      <div className="flex flex-col gap-y-4 p-6 pt-0">
         <div className="flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground max-w-[400px]">
               {t("subscribersInfo")}
            </p>
            <div className="flex flex-col items-end gap-y-1">
               {days && (
                  <span className="text-[10px] text-muted-foreground font-medium pr-1">
                     {getDateRange()}
                  </span>
               )}
               <Select
                 value={days?.toString() || "all"}
                 onValueChange={(value) => {
                   setDays(value === "all" ? undefined : Number(value));
                 }}
               >
                 <SelectTrigger className="w-[180px] h-9 text-xs bg-neutral-900 border-neutral-800">
                   <SelectValue placeholder={t("allTime")} />
                 </SelectTrigger>
                 <SelectContent className="bg-neutral-900 border-neutral-800">
                   <SelectItem value="7" className="text-xs">{t("last7Days")}</SelectItem>
                   <SelectItem value="28" className="text-xs">{t("last28Days")}</SelectItem>
                   <SelectItem value="90" className="text-xs">{t("last90Days")}</SelectItem>
                   <SelectItem value="365" className="text-xs">{t("last365Days")}</SelectItem>
                   <SelectItem value="all" className="text-xs">{t("allTime")}</SelectItem>
                 </SelectContent>
               </Select>
            </div>
         </div>

         <div className="max-h-[500px] overflow-auto custom-scrollbar">
            <Table className="min-w-[600px] table-fixed">
               <TableHeader>
                  <TableRow className="hover:bg-transparent border-neutral-800">
                     <TableHead className="text-neutral-400 font-bold uppercase text-[11px] w-[40%]">{t("channel")}</TableHead>
                     <TableHead className="text-neutral-400 font-bold uppercase text-[11px] w-[20%]">{t("dateSubscribed")}</TableHead>
                     <TableHead className="text-neutral-400 font-bold uppercase text-[11px] w-[25%]">{t("subscriberCount")}</TableHead>
                     <TableHead className="text-right text-neutral-400 font-bold uppercase text-[11px] w-[15%]">{t("action")}</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading && (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-neutral-800">
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  )}
                  {!isLoading && data?.pages.flatMap((page) => page.items || []).length === 0 && (
                    <TableRow className="hover:bg-transparent border-none">
                       <TableCell colSpan={4} className="h-[300px] text-center">
                          <div className="flex flex-col items-center justify-center gap-y-4">
                             <div className="p-4 rounded-full bg-neutral-900/50">
                                <SearchX className="size-10 text-muted-foreground" />
                             </div>
                             <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
                                {t("noRecentSubscribers")}
                             </p>
                          </div>
                       </TableCell>
                    </TableRow>
                  )}
                  {data?.pages.flatMap((page) => page.items || []).map((subscriber) => (
                    <TableRow key={subscriber.viewerId} className="border-neutral-800 hover:bg-neutral-900/50 transition-colors">
                       <TableCell>
                          <Link href={`/users/${subscriber.viewerId}`}>
                             <div className="flex items-center gap-x-3 hover:opacity-70 transition-opacity">
                                <UserAvatar
                                   imageUrl={subscriber.avatarUrl}
                                   name={subscriber.name}
                                   size="sm"
                                />
                                <span className="font-semibold text-sm whitespace-nowrap">
                                   {subscriber.name}
                                </span>
                             </div>
                          </Link>
                       </TableCell>
                       <TableCell className="text-sm text-neutral-300 whitespace-nowrap overflow-hidden text-ellipsis">
                          {format(new Date(subscriber.createdAt), "d 'thg' M, yyyy", { locale: dateLocale })}
                       </TableCell>
                       <TableCell className="text-sm text-neutral-300 whitespace-nowrap overflow-hidden text-ellipsis">
                          {p("subscribers", { count: subscriber.subscriberCount })}
                       </TableCell>
                       <TableCell className="text-right">
                          <SubscriptionButton
                            isSubscribed={subscriber.isSubscribedBack}
                            disabled={subscribe.isPending || unsubscribe.isPending}
                            onClick={() => onToggleSubscription(subscriber.viewerId, subscriber.isSubscribedBack)}
                            size="sm"
                            className="h-8 px-4 text-xs font-bold"
                          />
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
            <InfiniteScroll
               hasNextPage={hasNextPage}
               isFetchingNextPage={isFetchingNextPage}
               fetchNextPage={fetchNextPage}
            />
         </div>
      </div>
    </ResponsiveModal>
  );
};
