"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";
import cloudinary from "@/lib/cloudinary";

import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";

type MuxWebhookEvent = {
  type: string;
  data: any;
};

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;
if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET not set");

export const POST = async (request: Request) => {
  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");

  if (!muxSignature) {
    return new Response("No signature", { status: 401 });
  }

  let payload: MuxWebhookEvent;
  const rawBody = await request.text();

  try {
    await mux.webhooks.verifySignature(
      rawBody,
      {
        "mux-signature": muxSignature,
      },
      SIGNING_SECRET,
    );

    payload = JSON.parse(rawBody) as MuxWebhookEvent;
  } catch (err) {
    console.log("MUX VERIFY ERROR:", err);
    return new Response("Invalid signature", { status: 401 });
  }

  const updateVideo = async (
    muxStatus: string,
    updateFields: Record<string, any> = {},
    uploadId?: string,
  ) => {
    if (!uploadId) return;

    await db
      .update(videos)
      .set({
        muxStatus,
        ...updateFields,
      })
      .where(eq(videos.muxUploadId, uploadId));
  };

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data;
      await updateVideo(data.status, { muxAssetId: data.id }, data.upload_id);
      console.log("✅ Video created:", data.upload_id);
      break;
    }

    case "video.asset.ready": {
      const data = payload.data;
      const playbackId = data.playback_ids?.[0]?.id;
      if (!playbackId) {
        return new Response("Missing playbackId", { status: 400 });
      }

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      let thumbnailUrl: string | undefined;
      let thumbnailKey: string | undefined;
      let previewUrl: string | undefined;
      let previewKey: string | undefined;

      try {
        const utapi = new UTApi();
        const randomPercent = Math.floor(Math.random() * 90) + 5;
        const width = 1280;
        const height = 720;

        // 1. Tải ảnh Thumbnail lên UploadThing
        const thumb = await utapi.uploadFilesFromUrl(
          `https://image.mux.com/${playbackId}/thumbnail.png?width=${width}&height=${height}&time=${randomPercent}`,
        );

        if (thumb.data) {
          thumbnailUrl = thumb.data.url;
          thumbnailKey = thumb.data.key;
        }

        // 2. Tải ảnh GIF động lên Cloudinary
        const gif = await cloudinary.uploader.upload(
          `https://image.mux.com/${playbackId}/animated.gif`,
          {
            resource_type: "auto",
            folder: "mux-previews",
            public_id: playbackId,
            overwrite: true,
          },
        );

        if (gif && gif.secure_url) {
          previewUrl = gif.secure_url;
          previewKey = gif.public_id;
          console.log("✅ Cloudinary GIF uploaded:", previewUrl);
        }
      } catch (err) {
        console.log("⚠️ Upload failed:", err);
      }

      await updateVideo(
        "ready",
        {
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          previewKey,
          duration,
        },
        data.upload_id,
      );

      console.log("✅ Video ready:", data.upload_id);
      break;
    }

    case "video.asset.errored": {
      const data = payload.data;
      await updateVideo("errored", {}, data.upload_id);
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data;

      // Xóa GIF trên Cloudinary nếu có
      if (data.playback_ids?.[0]?.id) {
        try {
          await cloudinary.uploader.destroy(`mux-previews/${data.playback_ids[0].id}`);
        } catch (err) {
          console.warn("⚠️ Cloudinary delete failed:", err);
        }
      }

      if (data.upload_id) {
        await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
      }

      console.log("🗑️ Video deleted:", data.upload_id);
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data;
      await db
        .update(videos)
        .set({
          muxTrackId: data.id,
          muxTrackStatus: data.status,
        })
        .where(eq(videos.muxAssetId, data.asset_id));

      console.log("✅ Track ready:", data.asset_id);
      break;
    }

    case "video.asset.static_renditions.ready": {
      const data = payload.data;
      console.log("🔥 STATIC MP4 READY:", data.id);
      break;
    }
  }

  return new Response("Webhook processed", { status: 200 });
};