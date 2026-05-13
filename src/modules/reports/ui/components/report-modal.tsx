"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

const formSchema = z.object({
  reason: z.string().min(1, "Vui lòng chọn lý do"),
  description: z.string().optional(),
});

interface ReportModalProps {
  targetId: string;
  targetType: "video" | "comment" | "user" | "post";
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal = ({
  targetId,
  targetType,
  isOpen,
  onClose,
}: ReportModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Báo cáo đã được gửi. Cảm ơn bạn!");
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Không thể gửi báo cáo");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createReport.mutate({
      targetId,
      targetType,
      reason: values.reason,
      description: values.description,
    });
  };

  const reasons = [
    { value: "spam", label: "Nội dung rác hoặc gây hiểu lầm" },
    { value: "harassment", label: "Quấy rối hoặc bắt nạt" },
    { value: "hate_speech", label: "Ngôn từ gây thù ghét" },
    { value: "violence", label: "Nội dung bạo lực hoặc phản cảm" },
    { value: "sexual_content", label: "Nội dung khiêu dâm" },
    { value: "child_abuse", label: "Ngược đãi trẻ em" },
    { value: "other", label: "Lý do khác" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo vi phạm</DialogTitle>
          <DialogDescription>
            Nếu bạn thấy nội dung này vi phạm tiêu chuẩn cộng đồng, hãy cho chúng tôi biết.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lý do báo cáo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi tiết thêm (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cung cấp thêm thông tin về vi phạm..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createReport.isPending}>
                Gửi báo cáo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
