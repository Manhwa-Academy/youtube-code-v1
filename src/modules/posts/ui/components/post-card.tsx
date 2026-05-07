"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: any; 
}

export const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUser();
  const utils = trpc.useUtils();
  const [showComments, setShowComments] = useState(false);
  
  const react = trpc.posts.react.useMutation({
     onSuccess: () => utils.posts.getMany.invalidate(),
  });
  
  const vote = trpc.posts.vote.useMutation({
     onSuccess: () => utils.posts.getMany.invalidate(),
  });

  const remove = trpc.posts.remove.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa bài viết");
      utils.posts.getMany.invalidate();
    }
  });

  const isOwner = user?.id === post.user.clerkId;
  const hasVoted = post.poll?.options.some((opt: any) => opt.viewerVoted);
  const isQuiz = post.poll?.options.some((opt: any) => opt.isCorrect);
  const totalVotes = post.poll?.options.reduce((acc: number, o: any) => acc + (o.voteCount || 0), 0) || 0;

  const handleVote = (optionId: string) => {
    if (isOwner) {
      toast.error("Chủ kênh không thể bình chọn bài viết của mình");
      return;
    }
    vote.mutate({ postId: post.id, optionId });
  };

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900 shadow-sm hover:border-gray-300 transition-colors">
       <div className="flex gap-3">
          <UserAvatar name={post.user.name} imageUrl={post.user.imageUrl} size="sm" />
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{post.user.name}</span>
                <span className="text-[11px] text-muted-foreground">
                   {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                </span>
                
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto size-8 text-gray-500">
                         <MoreVertical className="size-4" />
                      </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                      {isOwner && (
                        <DropdownMenuItem className="text-red-500" onClick={() => remove.mutate({ id: post.id })}>
                           <Trash2 className="size-4 mr-2" />
                           Xóa bài viết
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Báo cáo</DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
             </div>
             
             <div className="text-sm whitespace-pre-wrap mb-2 leading-relaxed">
                {post.content}
             </div>

             {isQuiz && (
                <div className="text-xs text-muted-foreground mb-3">
                   {totalVotes} người đã trả lời
                </div>
             )}

             {/* Images */}
             {post.images && post.images.length > 0 && (
                <div className={cn(
                   "grid gap-2 mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-neutral-800",
                   post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                )}>
                   {post.images.map((img: any) => (
                      <div key={img.id} className="relative aspect-video">
                         <Image src={img.imageUrl} alt="" fill className="object-cover" />
                      </div>
                   ))}
                </div>
             )}

             {/* Poll / Quiz */}
             {post.poll && (
                <div className="mb-4 space-y-2">
                   {post.poll.options.map((opt: any) => {
                      const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                      const showResult = hasVoted || isOwner;
                      
                      return (
                         <div key={opt.id} className="space-y-1">
                            <div 
                              className={cn(
                                 "relative group cursor-pointer border rounded-lg overflow-hidden transition-all",
                                 opt.viewerVoted ? "border-blue-500 bg-blue-50/5" : "border-gray-200 dark:border-neutral-800 hover:bg-gray-50/50",
                                 showResult && isQuiz && opt.isCorrect && "border-green-500 bg-green-50/5",
                                 showResult && isQuiz && opt.viewerVoted && !opt.isCorrect && "border-red-500 bg-red-50/5"
                              )}
                              onClick={() => !showResult && handleVote(opt.id)}
                            >
                               {/* Progress bar background */}
                               {showResult && (
                                 <div 
                                   className={cn(
                                     "absolute left-0 top-0 bottom-0 transition-all duration-500",
                                     opt.viewerVoted ? "bg-blue-100 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-neutral-800",
                                     isQuiz && opt.isCorrect && "bg-green-100 dark:bg-green-900/20",
                                     isQuiz && opt.viewerVoted && !opt.isCorrect && "bg-red-100 dark:bg-red-900/20"
                                   )} 
                                   style={{ width: `${percentage}%` }}
                                 />
                               )}
                               
                               <div className="relative flex items-center p-3 gap-3">
                                  {post.poll.type === "image" && opt.imageUrl && (
                                     <div className="relative size-12 rounded-md overflow-hidden flex-shrink-0">
                                        <Image src={opt.imageUrl} alt="" fill className="object-cover" />
                                     </div>
                                  )}
                                  <span className={cn(
                                    "flex-1 text-sm font-medium",
                                    opt.viewerVoted && "text-blue-600 dark:text-blue-400",
                                    showResult && isQuiz && opt.isCorrect && "text-green-600 dark:text-green-400",
                                    showResult && isQuiz && opt.viewerVoted && !opt.isCorrect && "text-red-600 dark:text-red-400"
                                  )}>{opt.text}</span>
                                  
                                  {showResult && (
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-bold">{percentage}%</span>
                                       {isQuiz && opt.isCorrect && (
                                          <CheckCircle2 className="size-5 text-green-600" />
                                       )}
                                    </div>
                                  )}
                               </div>
                            </div>
                            {showResult && isQuiz && opt.isCorrect && opt.explanation && (
                               <div className="text-[11px] text-muted-foreground bg-gray-50 dark:bg-neutral-800/50 p-2 rounded-lg ml-2">
                                  {opt.explanation}
                               </div>
                            )}
                         </div>
                      );
                   })}
                   {!isQuiz && (
                      <div className="text-[10px] text-gray-500 pl-1">
                         {totalVotes} lượt bình chọn
                      </div>
                   )}
                </div>
             )}

             {/* Footer Actions */}
             <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1 group">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className={cn("size-8 group-hover:bg-gray-100 dark:group-hover:bg-neutral-800 rounded-full", post.viewerReaction === "like" && "text-blue-500")}
                     onClick={() => react.mutate({ postId: post.id, type: post.viewerReaction === "like" ? "none" : "like" })}
                   >
                      <ThumbsUp className="size-4" />
                   </Button>
                   <span className="text-xs text-muted-foreground">{post.likeCount}</span>
                </div>

                <div className="flex items-center gap-1 group">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className={cn("size-8 group-hover:bg-gray-100 dark:group-hover:bg-neutral-800 rounded-full", post.viewerReaction === "dislike" && "text-red-500")}
                     onClick={() => react.mutate({ postId: post.id, type: post.viewerReaction === "dislike" ? "none" : "dislike" })}
                   >
                      <ThumbsDown className="size-4" />
                   </Button>
                   <span className="text-xs text-muted-foreground">{post.dislikeCount}</span>
                </div>

                <div className="flex items-center gap-1 group">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "size-8 group-hover:bg-gray-100 dark:group-hover:bg-neutral-800 rounded-full",
                      showComments && "text-blue-500 bg-gray-100 dark:bg-neutral-800"
                    )}
                    onClick={() => setShowComments(!showComments)}
                   >
                      <MessageSquare className="size-4" />
                   </Button>
                   <span className="text-xs text-muted-foreground">0</span>
                </div>
             </div>

             {/* Simple Comments Placeholder */}
             {showComments && (
               <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <div className="text-xs text-muted-foreground italic">
                     Tính năng bình luận bài viết đang được phát triển...
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};
