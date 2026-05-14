"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { trpc } from "@/trpc/client";
import { videoUpdateSchema } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface VideoEditModalProps {
  videoId: string;
  title: string;
  description: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoEditModal = ({
  videoId,
  title,
  description,
  open,
  onOpenChange,
}: VideoEditModalProps) => {
  const t = useTranslations("Studio");
  const utils = trpc.useUtils();
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      toast.success(t("updateVideoSuccess"));
      utils.studio.getMany.invalidate();
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t("errorOccurred"));
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: {
      id: videoId,
      title: title,
      description: description,
    },
  });

  const onSubmit = (values: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#1f1f1f] border-none text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-medium">{t("editTitleDesc")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="relative group border-2 border-neutral-700 focus-within:border-blue-500 rounded-md px-3 py-2 transition-colors bg-transparent">
                    <FormLabel className="text-xs text-neutral-400 group-focus-within:text-blue-500">
                      {t("titleRequired")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-base bg-transparent text-white"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="relative group border-2 border-neutral-700 focus-within:border-blue-500 rounded-md px-3 py-2 transition-colors bg-transparent">
                    <FormLabel className="text-xs text-neutral-400 group-focus-within:text-blue-500">
                      {t("description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={4}
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none min-h-[120px] bg-transparent text-white text-base"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-full px-6 text-white hover:bg-neutral-800"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={update.isPending}
                className="rounded-full px-6 bg-neutral-700 text-neutral-400 hover:bg-neutral-600 disabled:opacity-50"
              >
                {t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
