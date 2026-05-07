"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  ImageIcon, 
  BarChart2, 
  ListTodo, 
  VideoIcon, 
  HelpCircle,
  X,
  Plus,
  Trash2,
  ImagePlusIcon
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  userId: string;
}

type PollOption = {
  id: string;
  text: string;
  imageUrl?: string;
  imageKey?: string;
};

export const PostEditor = ({ userId }: PostEditorProps) => {
  const { user } = useUser();
  const utils = trpc.useUtils();
  
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [postType, setPostType] = useState<"text" | "image" | "poll" | "video" | "question">("text");
  const [pollType, setPollType] = useState<"text" | "image">("text");
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [selectedImages, setSelectedImages] = useState<{ url: string; key?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: channelUser } = trpc.users.getOne.useQuery({ id: userId });
  
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Đã đăng bài viết!");
      setContent("");
      setSelectedImages([]);
      setPollOptions([{ id: "1", text: "" }, { id: "2", text: "" }]);
      setPostType("text");
      setIsExpanded(false);
      utils.posts.getMany.invalidate({ userId });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi đăng bài!");
    }
  });

  const isOwner = user?.id && channelUser?.clerkId === user.id;

  if (!isOwner || !channelUser) return null;

  const handlePost = async () => {
    if (!content.trim() && selectedImages.length === 0 && postType === "text") return;

    createPost.mutate({
      content,
      type: postType === "question" ? "text" : postType,
      images: postType === "image" ? selectedImages : undefined,
      poll: postType === "poll" ? {
        type: pollType,
        options: pollOptions.map(opt => ({ text: opt.text, url: opt.imageUrl, key: opt.imageKey })),
      } : undefined,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, optionId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    
    try {
       for (let i = 0; i < files.length; i++) {
         formData.append("file", files[i]);
         formData.append("upload_preset", "youtube_clone");
         
         const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
           method: "POST",
           body: formData,
         });
         
         const data = await response.json();
         
         if (optionId) {
            setPollOptions(prev => prev.map(opt => opt.id === optionId ? { ...opt, imageUrl: data.secure_url, imageKey: data.public_id } : opt));
         } else {
            setSelectedImages(prev => [...prev, { url: data.secure_url, key: data.public_id }]);
         }
       }
    } catch (error) {
       toast.error("Lỗi khi tải ảnh lên!");
    } finally {
       setIsUploading(false);
       if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, { id: Math.random().toString(), text: "" }]);
    }
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(opt => opt.id !== id));
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl p-4 bg-white dark:bg-neutral-900 shadow-sm mb-6">
      <div className="flex gap-3">
        <UserAvatar
          name={channelUser.name}
          imageUrl={channelUser.imageUrl}
          size="sm"
        />
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
             <span className="font-medium text-black dark:text-white">{channelUser.name}</span>
             <span>Trạng thái hiển thị: <span className="font-semibold text-black dark:text-white">Công khai</span></span>
          </div>
          
          <Textarea
            placeholder="Bạn đang nghĩ gì?"
            className="border-none focus-visible:ring-0 resize-none min-h-[40px] p-0 text-base placeholder:text-gray-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />

          {(postType === "poll" || postType === "question") && (
            <div className="mt-2 space-y-3 p-4 border rounded-xl border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
               {pollOptions.map((option, index) => (
                 <div key={option.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                       {postType === "poll" && pollType === "image" ? (
                         <div 
                           className="relative w-20 h-20 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group"
                           onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) => handleImageUpload(e as any, option.id);
                              input.click();
                           }}
                         >
                           {option.imageUrl ? (
                             <Image src={option.imageUrl} alt="" fill className="object-cover" />
                           ) : (
                             <ImageIcon className="size-6 text-gray-400" />
                           )}
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ImagePlusIcon className="size-5 text-white" />
                           </div>
                         </div>
                       ) : (
                         <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                            {postType === "question" ? (
                              <X className="size-4 text-gray-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                            )}
                         </div>
                       )}
                       
                       <div className="flex-1 relative">
                          <Input
                            placeholder={postType === "question" ? "Thêm lựa chọn" : `Lựa chọn ${index + 1}`}
                            value={option.text}
                            onChange={(e) => {
                              setPollOptions(prev => prev.map(opt => opt.id === option.id ? { ...opt, text: e.target.value } : opt));
                            }}
                            className={cn(
                              "bg-transparent border-gray-300 dark:border-neutral-700 h-10 px-0 rounded-none border-t-0 border-x-0 border-b focus-visible:ring-0",
                              pollType === "image" && postType === "poll" ? "px-3 rounded-md border-t border-x" : ""
                            )}
                          />
                          <span className="absolute right-0 bottom-1 text-[10px] text-gray-500">
                             0/{postType === "question" ? "65" : "36"}
                          </span>
                       </div>
                       
                       {postType === "poll" && (
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="size-8 text-gray-500 hover:text-red-500"
                           onClick={() => removePollOption(option.id)}
                         >
                           <Trash2 className="size-4" />
                         </Button>
                       )}
                    </div>
                 </div>
               ))}
               
               <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500 hover:bg-blue-50 px-0"
                    onClick={addPollOption}
                  >
                    {postType === "question" ? "Thêm lựa chọn khác" : "Thêm lựa chọn"}
                  </Button>
                  {pollType === "image" && postType === "poll" && (
                    <Button variant="outline" size="sm" className="flex-1 rounded-full">
                       Đổi vị trí hình ảnh
                    </Button>
                  )}
               </div>
            </div>
          )}

          {postType === "image" && selectedImages.length > 0 && (
            <div className={cn(
              "grid gap-2 mt-2",
              selectedImages.length > 1 ? "grid-cols-2" : "grid-cols-1"
            )}>
               {selectedImages.map((img, i) => (
                 <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                    <Image src={img.url} alt="" fill className="object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 size-7 rounded-full"
                      onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))}
                    >
                       <X className="size-4" />
                    </Button>
                 </div>
               ))}
            </div>
          )}

          {isExpanded && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 multiple 
                 accept="image/*"
                 onChange={handleImageUpload}
               />
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={cn("gap-2 text-xs h-8", postType === "image" && "bg-gray-100")}
                 onClick={() => {
                   setPostType("image");
                   fileInputRef.current?.click();
                 }}
               >
                  <ImageIcon className="size-4 text-blue-500" />
                  Hình ảnh
               </Button>
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={cn("gap-2 text-xs h-8", postType === "poll" && pollType === "image" && "bg-gray-100")}
                 onClick={() => {
                   setPostType("poll");
                   setPollType("image");
                 }}
               >
                  <BarChart2 className="size-4 text-blue-500" />
                  Cuộc thăm dò ý kiến dạng hình ảnh
               </Button>
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={cn("gap-2 text-xs h-8", postType === "poll" && pollType === "text" && "bg-gray-100")}
                 onClick={() => {
                   setPostType("poll");
                   setPollType("text");
                 }}
               >
                  <ListTodo className="size-4 text-blue-500" />
                  Cuộc thăm dò ý kiến dạng văn bản
               </Button>
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={cn("gap-2 text-xs h-8", postType === "video" && "bg-gray-100")}
                 onClick={() => setPostType("video")}
               >
                  <VideoIcon className="size-4 text-blue-500" />
                  Video
               </Button>
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={cn("gap-2 text-xs h-8", postType === "question" && "bg-gray-100")}
                 onClick={() => setPostType("question")}
               >
                  <HelpCircle className="size-4 text-blue-500" />
                  Câu hỏi
               </Button>
               
               <div className="ml-auto flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setIsExpanded(false);
                    setPostType("text");
                    setSelectedImages([]);
                    setPollOptions([{ id: "1", text: "" }, { id: "2", text: "" }]);
                  }}>Hủy</Button>
                  <Button 
                    size="sm" 
                    className="bg-black dark:bg-white text-white dark:text-black rounded-full px-6"
                    disabled={(!content.trim() && selectedImages.length === 0 && postType !== "poll") || isUploading || createPost.isPending}
                    onClick={handlePost}
                  >
                    {createPost.isPending ? "Đang đăng..." : "Đăng"}
                  </Button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
