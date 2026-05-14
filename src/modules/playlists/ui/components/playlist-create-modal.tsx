"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlaylistCreateModal = ({
  open,
  onOpenChange,
}: PlaylistCreateModalProps) => {
  const t = useTranslations("Playlists");

  const formSchema = z.object({
    name: z.string().min(1, t("nameLabel")),
    visibility: z.enum(["public", "private"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      visibility: "private",
    },
  });

  const utils = trpc.useUtils();

  const createPlaylist = trpc.playlists.create.useMutation({
    onSuccess: () => {
      utils.playlists.getMany.invalidate();
      toast.success(t("updateSuccess")); // Or add a specific toast for creation
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || t("errorOccurred"));
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPlaylist.mutate({
      name: values.name,
      visibility: values.visibility,
    });
  };

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        visibility: "private",
      });
    }
  }, [open, form]);

  return (
    <ResponsiveModal
      title={t("createModalTitle")}
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
                <FormLabel>{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("namePlaceholder")} />
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
                <FormLabel>{t("visibilityLabel")}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border rounded px-2 py-2 w-full dark:bg-zinc-900"
                  >
                    <option value="private">{t("private")}</option>
                    <option value="public">{t("public")}</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={createPlaylist.isPending}>
              {t("createButton")}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
