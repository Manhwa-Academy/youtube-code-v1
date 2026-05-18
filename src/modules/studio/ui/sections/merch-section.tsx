"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { ShoppingBag, Plus, Trash2, ExternalLink, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const MerchSection = () => {
  const t = useTranslations("Merch");
  const { user } = useUser();
  const utils = trpc.useUtils();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (!user) return null;

  const { data: products, isLoading } = trpc.merch.getManyByCreator.useQuery({
    userId: user.id,
  });

  const addProduct = trpc.merch.create.useMutation({
    onSuccess: () => {
      toast.success(t("addProductSuccess"));
      setIsOpen(false);
      setTitle("");
      setPrice("");
      setExternalLink("");
      setImageUrl("");
      utils.merch.getManyByCreator.invalidate({ userId: user.id });
    },
    onError: () => {
      toast.error(t("addProductError"));
    },
  });

  const deleteProduct = trpc.merch.delete.useMutation({
    onSuccess: () => {
      toast.success(t("deleteProductSuccess"));
      utils.merch.getManyByCreator.invalidate({ userId: user.id });
    },
    onError: () => {
      toast.error(t("deleteProductError"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !externalLink.trim() || !imageUrl.trim()) {
      toast.error(t("fillAllFields"));
      return;
    }
    addProduct.mutate({
      title: title.trim(),
      price: price.trim(),
      externalLink: externalLink.trim(),
      imageUrl: imageUrl.trim(),
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Upper header block */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
              {t("manageMerch")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("manageMerchDescription")}
            </p>
          </div>
        </div>

        {/* Add Product Modal button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-750 text-white rounded-full px-5 flex items-center gap-1.5 shadow-md">
              <Plus className="size-4" />
              {t("addProduct")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-violet-600">
                <Sparkles className="size-5" />
                {t("addProduct")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">{t("productTitle")}</Label>
                <Input
                  id="title"
                  placeholder="Áo thun Merch đặc biệt..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">{t("productPrice")}</Label>
                <Input
                  id="price"
                  placeholder="$19.99 hoặc 450.000đ"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link">{t("productLink")}</Label>
                <Input
                  id="link"
                  placeholder="https://shopee.vn/product/..."
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  type="url"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image">{t("productImage")} (URL)</Label>
                <Input
                  id="image"
                  placeholder="https://example.com/product.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="url"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)} type="button">
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={addProduct.isPending}
                  className="bg-violet-600 hover:bg-violet-750 text-white rounded-full px-5"
                >
                  {addProduct.isPending ? t("adding") : t("addProduct")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products table */}
      <div className="border rounded-2xl overflow-hidden bg-white/50 dark:bg-neutral-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("image")}</TableHead>
              <TableHead>{t("productTitle")}</TableHead>
              <TableHead>{t("productPrice")}</TableHead>
              <TableHead>{t("productLink")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="size-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></TableCell>
                  <TableCell><div className="h-8 w-8 ml-auto bg-neutral-200 dark:bg-neutral-800 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : !products || products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShoppingBag className="size-10 text-muted-foreground/45" />
                    <p className="text-sm font-medium">{t("noProducts")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                  <TableCell>
                    <div className="size-12 rounded-lg overflow-hidden border bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
                      <img src={product.imageUrl} alt={product.title} className="object-cover w-full h-full" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {product.title}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      {product.price}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={product.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 inline-flex"
                    >
                      <span>{t("viewLink")}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProduct.mutate({ id: product.id })}
                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full size-8"
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
