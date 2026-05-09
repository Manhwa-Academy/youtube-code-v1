import { PostFormSection } from "@/modules/studio/ui/sections/post-form-section";

interface PostViewProps {
  postId: string;
};

export const PostView = ({ postId }: PostViewProps) => {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg">
      <PostFormSection postId={postId} />
    </div>
  );
};
