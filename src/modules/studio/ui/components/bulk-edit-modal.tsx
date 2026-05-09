"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  type: "input" | "textarea";
  placeholder?: string;
}

export const BulkEditModal = ({
  open,
  onClose,
  onConfirm,
  title,
  label,
  type,
  placeholder
}: BulkEditModalProps) => {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    onConfirm(value);
    setValue("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{label}</Label>
            {type === "input" ? (
              <Input 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder={placeholder}
              />
            ) : (
              <Textarea 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder={placeholder}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={!value.trim()}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
