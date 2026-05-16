import { Metadata } from "next";
import { HydrateClient, trpc } from "@/trpc/server";

import { DEFAULT_LIMIT } from "@/constants";
import { HashtagView } from "@/modules/search/ui/views/hashtag-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;

  return {
    title: `#${tag}`,
  };
}

const Page = async ({ params }: PageProps) => {
  const { tag } = await params;

  void trpc.search.getHashtagMany.prefetchInfinite({
    tag,
    limit: DEFAULT_LIMIT,
  });

  return ( 
    <HydrateClient>
      <HashtagView tag={tag} />
    </HydrateClient>
  );
}
 
export default Page;
