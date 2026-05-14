"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Reports");

  const formSchema = z.object({
    reason: z.string().min(1, t("selectReason")),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success(t("reportSentSuccess"));
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || t("reportSentError"));
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
    { value: "spam", label: t("reason_spam") },
    { value: "harassment", label: t("reason_harassment") },
    { value: "hate_speech", label: t("reason_hate_speech") },
    { value: "violence", label: t("reason_violence") },
    { value: "sexual_content", label: t("reason_sexual_content") },
    { value: "child_abuse", label: t("reason_child_abuse") },
    { value: "other", label: t("reason_other") },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reportTitle")}</DialogTitle>
          <DialogDescription>
            {t("reportDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reasonLabel")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectReasonPlaceholder")} />
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
                  <FormLabel>{t("moreDetailsLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("moreDetailsPlaceholder")}
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
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createReport.isPending}>
                {t("submitReport")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
