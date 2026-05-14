import { useTranslations } from "next-intl";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useUser, useClerk } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { commentInsertSchema } from "@/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { GifPicker } from "./gif-picker";
import { ImageIcon, TimerIcon, XIcon } from "lucide-react";
import { usePlayerStore } from "@/modules/videos/store/use-player-store";

interface CommentFormProps {
  videoId?: string;
  postId?: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}

export const CommentForm = ({
  videoId,
  postId,
  parentId,
  onCancel,
  onSuccess,
  variant = "comment",
}: CommentFormProps) => {
  const t = useTranslations("Comments");
  const clerk = useClerk();
  const { user } = useUser();

  const utils = trpc.useUtils();
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate();
      form.reset();
      toast.success(t("addSuccess"));
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(t("error"));

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const form = useForm<z.infer<typeof commentInsertSchema>>({
    resolver: zodResolver(commentInsertSchema.omit({ userId: true })),
    defaultValues: {
      parentId: parentId,
      videoId: videoId,
      postId: postId,
      value: "",
      imageUrl: null as string | null,
      timestamp: null as number | null,
    },
  });

  const { currentTime } = usePlayerStore();

  const imageUrl = form.watch("imageUrl");
  const timestamp = form.watch("timestamp");


  const handleSubmit = (values: z.infer<typeof commentInsertSchema>) => {
    create.mutate(values);
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex gap-4 group"
      >
        <UserAvatar
          size="lg"
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          name={user?.username || t("userPlaceholder")}
        />

        <div className="flex-1">
          <FormField
            name="value"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      variant === "reply"
                        ? t("replyPlaceholder")
                        : t("placeholder")
                    }
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(imageUrl || timestamp !== null) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imageUrl && (
                <div className="relative group rounded-lg overflow-hidden border max-w-[150px]">
                  <img src={imageUrl} alt="Preview" className="w-full h-auto" />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => form.setValue("imageUrl", null)}
                  >
                    <XIcon className="size-3" />
                  </Button>
                </div>
              )}
              {typeof timestamp === "number" && (
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <TimerIcon className="size-3" />
                  {Math.floor(timestamp / 60)}:{(timestamp % 60).toString().padStart(2, '0')}
                  <XIcon 
                    className="size-3 cursor-pointer hover:text-blue-800" 
                    onClick={() => form.setValue("timestamp", null)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="justify-between items-center gap-2 mt-2 flex">
            <div className="flex items-center gap-1">
              <GifPicker onSelect={(url) => form.setValue("imageUrl", url)}>
                <Button variant="ghost" size="icon" type="button" className="size-8 text-muted-foreground hover:text-blue-500">
                  <ImageIcon className="size-4" />
                </Button>
              </GifPicker>
              {videoId && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  type="button" 
                  className="size-8 text-muted-foreground hover:text-blue-500"
                  onClick={() => form.setValue("timestamp", Math.floor(currentTime))}
                  title={t("addTimestamp")}
                >
                  <TimerIcon className="size-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="ghost" type="button" onClick={handleCancel}>
                  {t("cancel")}
                </Button>
              )}
              <Button disabled={create.isPending || (!form.watch("value") && !form.watch("imageUrl"))} type="submit" size="sm">
                {variant === "reply" ? t("addReply") : t("addComment")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
