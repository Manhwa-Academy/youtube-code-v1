import { HydrateClient, trpc } from "@/trpc/server";

import { PostCommentsView } from "@/modules/studio/ui/views/post-comments-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ postId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const { postId } = await params;

  void trpc.studio.getPost.prefetch({ id: postId });
  void trpc.comments.getMany.prefetch({ 
    postId, 
    limit: 10,
  });

  return ( 
    <HydrateClient>
      <PostCommentsView postId={postId} />
    </HydrateClient>
  );
};
 
export default Page;
