"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Button } from "@/components/ui/button";

import { useTranslations } from "next-intl";

interface AdvancedAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: string;
  days: number;
  videoId?: string;
}

export const AdvancedAnalyticsModal = ({ 
  isOpen, 
  onClose, 
  dateRange,
  days,
  videoId
}: AdvancedAnalyticsModalProps) => {
  const t = useTranslations("Studio");
  const [data] = trpc.studio.getAnalytics.useSuspenseQuery({ days, videoId });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden bg-white dark:bg-[#1f1f1f] border-none shadow-2xl">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-x-4">
             <DialogTitle className="text-xl font-bold">{t("advancedAnalytics")}</DialogTitle>
             <div className="text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                {dateRange}
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t("viewsChart")}</h3>
              <div className="h-[400px] w-full bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.viewsByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888888' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#888888' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3ea6ff" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3ea6ff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">{t("contentDistribution")}</h3>
              <div className="h-[400px] w-full bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Video', value: data.contentBreakdown.views.video },
                    { name: 'Shorts', value: data.contentBreakdown.views.shorts },
                    { name: 'Posts', value: data.contentBreakdown.views.posts },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888888' }}
                      tickFormatter={(val) => val === 'Posts' ? t("posts") : val}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888888' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#3ea6ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
