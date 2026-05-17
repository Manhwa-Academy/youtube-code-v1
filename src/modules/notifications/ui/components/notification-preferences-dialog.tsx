import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, Bell, Mail, Smartphone, Monitor, Loader2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { subscribeToPush } from "@/lib/register-push";

export const NotificationPreferencesDialog = () => {
  const t = useTranslations("Notifications");
  const utils = trpc.useUtils();
  
  // Safe Translation helper to prevent next-intl runtime exception on missing keys
  const safeT = (key: string, fallback: string) => {
    try {
      return t.has(key) ? t(key) : fallback;
    } catch {
      return fallback;
    }
  };

  const { data: preferences, isLoading } = trpc.notifications.getPreferences.useQuery();
  const updatePreference = trpc.notifications.updatePreference.useMutation({
    onSuccess: () => {
      utils.notifications.getPreferences.invalidate();
    },
    onError: () => {
      toast.error("Không thể cập nhật cài đặt thông báo / Failed to update preferences");
    }
  });

  const savePushSubscription = trpc.notifications.savePushSubscription.useMutation({
    onSuccess: () => {
      toast.success("Đã đăng ký nhận thông báo trình duyệt / Push notifications registered!");
    },
    onError: () => {
      console.error("Failed to save push subscription in DB");
    }
  });

  const handleToggle = async (
    type: "video_like" | "video_comment" | "comment_reply" | "comment_like" | "subscription" | "post_like" | "post_comment",
    field: "inApp" | "push" | "email",
    currentVal: boolean
  ) => {
    const newVal = !currentVal;
    
    // If turning on Web Push, request permission and subscribe!
    if (field === "push" && newVal) {
      await subscribeToPush(savePushSubscription.mutate);
    }

    updatePreference.mutate({
      type,
      [field]: newVal
    });
  };

  const getFriendlyName = (type: string) => {
    switch (type) {
      case "video_like": return safeT("video_like_pref", "Lượt thích video");
      case "video_comment": return safeT("video_comment_pref", "Bình luận trên video");
      case "comment_reply": return safeT("comment_reply_pref", "Phản hồi bình luận");
      case "comment_like": return safeT("comment_like_pref", "Thích bình luận");
      case "subscription": return safeT("subscription_pref", "Người đăng ký mới");
      case "post_like": return safeT("post_like_pref", "Thích bài viết");
      case "post_comment": return safeT("post_comment_pref", "Bình luận bài viết");
      default: return type;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900" title={safeT("preferencesTitle", "Cài đặt thông báo")}>
          <SlidersHorizontal className="size-4 text-neutral-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-6 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <Bell className="size-5 text-red-600 animate-bounce" />
            {safeT("preferencesTitle", "Cài đặt thông báo")}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500 dark:text-neutral-400">
            {safeT("preferencesDesc", "Cá nhân hóa các loại thông báo bạn muốn nhận trên các kênh khác nhau.")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="size-8 animate-spin text-red-600" />
            <p className="text-xs text-neutral-400">Đang tải cài đặt của bạn...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {/* Header Columns */}
            <div className="grid grid-cols-12 pb-2 border-b border-neutral-100 dark:border-neutral-900 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
              <div className="col-span-6">{safeT("activityType", "Hoạt động")}</div>
              <div className="col-span-2 text-center flex justify-center items-center gap-1">
                <Monitor className="size-3.5" />
                <span className="hidden sm:inline">{safeT("inAppNotify", "In-App")}</span>
              </div>
              <div className="col-span-2 text-center flex justify-center items-center gap-1">
                <Smartphone className="size-3.5" />
                <span className="hidden sm:inline">{safeT("pushNotify", "Push")}</span>
              </div>
              <div className="col-span-2 text-center flex justify-center items-center gap-1">
                <Mail className="size-3.5" />
                <span className="hidden sm:inline">{safeT("emailNotify", "Email")}</span>
              </div>
            </div>

            {/* Preference Rows */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {preferences?.map((pref) => (
                <div key={pref.type} className="grid grid-cols-12 py-3.5 items-center hover:bg-neutral-50/50 dark:hover:bg-zinc-900/30 px-1 rounded-lg transition-colors">
                  <div className="col-span-6 pr-2">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {getFriendlyName(pref.type)}
                    </p>
                  </div>
                  
                  {/* In-App */}
                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={pref.inApp}
                      onCheckedChange={() => handleToggle(pref.type as any, "inApp", pref.inApp)}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>

                  {/* Web Push */}
                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={pref.push}
                      onCheckedChange={() => handleToggle(pref.type as any, "push", pref.push)}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={pref.email}
                      onCheckedChange={() => handleToggle(pref.type as any, "email", pref.email)}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
