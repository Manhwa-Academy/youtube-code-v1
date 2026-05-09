import { HydrateClient, trpc } from "@/trpc/server";

import { PostView } from "@/modules/studio/ui/views/post-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ postId: string }>;
};

const Page = async ({ params }: PageProps) => {
  const { postId } = await params;

  void trpc.studio.getPost.prefetch({ id: postId });

  return ( 
    <HydrateClient>
      <PostView postId={postId} />
    </HydrateClient>
  );
};
 
export default Page;
