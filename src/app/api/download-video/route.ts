export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { mux } from "@/lib/mux";

export async function GET(req: NextRequest) {
  const assetId = req.nextUrl.searchParams.get("assetId");

  if (!assetId) {
    return new Response("Missing assetId", { status: 400 });
  }

  try {
    const asset: any = await mux.video.assets.retrieve(assetId);

    console.log("MUX ASSET RETRIEVE:", asset);

    const playbackId = asset.playback_ids?.[0]?.id;

    if (!playbackId) {
      return new Response("Playback not found", { status: 404 });
    }

    // mp4_support/static renditions enabled => Mux auto exposes mp4 file
    const mp4Url = `https://stream.mux.com/${playbackId}/high.mp4`;

    return Response.redirect(mp4Url, 302);
  } catch (error) {
    console.log("DOWNLOAD VIDEO ERROR:", error);
    return new Response("Download failed", { status: 500 });
  }
}
