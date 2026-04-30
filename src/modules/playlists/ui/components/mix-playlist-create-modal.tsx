"use client";

import { z } from "zod";
import { toast } from "sonner";
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

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên danh sách"),
  visibility: z.enum(["public", "private"]).default("public"),
});

export const MixPlaylistCreateModal = ({
  open,
  onOpenChange,
  initialVideoIds,
}: MixPlaylistCreateModalProps) => {
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
      toast.success("Tạo danh sách kết hợp thành công!");
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Đã xảy ra lỗi");
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
      title="Tạo danh sách kết hợp"
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
                <FormLabel>Tên danh sách</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ví dụ: Series Noa" />
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
                <FormLabel>Quyền riêng tư</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border rounded px-2 py-2 w-full"
                  >
                    <option value="public">Công khai</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={createMixPlaylist.isPending}>
              Tạo
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};