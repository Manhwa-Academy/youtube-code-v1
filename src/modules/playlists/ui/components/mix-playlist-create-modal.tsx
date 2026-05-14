"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface MixPlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVideoIds: string[];
}

export const MixPlaylistCreateModal = ({
  open,
  onOpenChange,
  initialVideoIds,
}: MixPlaylistCreateModalProps) => {
  const t = useTranslations("Playlists");

  const formSchema = z.object({
    name: z.string().min(1, t("playlistNameRequired")),
    visibility: z.enum(["public", "private"]).default("public"),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      visibility: "public",
    },
  });

  const utils = trpc.useUtils();

  const createMixPlaylist = trpc.playlists.createMixPlaylist.useMutation({
    onSuccess: () => {
      utils.playlists.getPublicMixPlaylists.invalidate();
      utils.playlists.getManyForVideo.invalidate();
      toast.success(t("playlistCreatedSuccess"));
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || t("errorOccurred"));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMixPlaylist.mutate({
      name: values.name,
      videoIds: initialVideoIds,
      visibility: values.visibility,
    });
  };

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        visibility: "public",
      });
    }
  }, [open, form]);

  return (
    <ResponsiveModal
      title={t("createMixPlaylist")}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("playlistName")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("playlistNamePlaceholder")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("privacy")}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border rounded px-2 py-2 w-full"
                  >
                    <option value="public">{t("public")}</option>
                    <option value="private">{t("private")}</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={createMixPlaylist.isPending}>
              {t("create")}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};