import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { Redis } from "@upstash/redis";
import { db } from "@/db";
import { videos } from "@/db/schema";

const languageMap: Record<string, string> = {
  vi: "Vietnamese",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese (Simplified)",
  en: "English",
};

// Initialize Upstash Redis cache
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await props.params;
  const searchParams = req.nextUrl.searchParams;
  const lang = searchParams.get("lang") || "vi";

  const targetLanguage = languageMap[lang] || "Vietnamese";

  // Check cache first
  const cacheKey = `video:${videoId}:subtitles:${lang}`;
  try {
    const cachedVtt = await redis.get<string>(cacheKey);
    if (cachedVtt) {
      console.log(`[SUBTITLE_TRANSLATION] Cache hit for videoId: ${videoId}, lang: ${lang}`);
      return new Response(cachedVtt, {
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    console.error("[SUBTITLE_TRANSLATION] Redis cache error:", error);
  }

  // Fetch video details
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoId));

  if (!video || !video.muxPlaybackId || !video.muxTrackId) {
    return new Response("WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n[Phụ đề chưa được xử lý hoặc không có sẵn]", {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Fetch original VTT subtitle track from Mux
  let vttContent = "";
  try {
    const muxVttUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.vtt`;
    console.log(`[SUBTITLE_TRANSLATION] Fetching original subtitle from Mux: ${muxVttUrl}`);
    const res = await fetch(muxVttUrl);
    if (res.ok) {
      vttContent = await res.text();
    }
  } catch (error) {
    console.error("[SUBTITLE_TRANSLATION] Mux subtitle fetch error:", error);
  }

  if (!vttContent) {
    return new Response("WEBVTT\n\n00:00:00.000 --> 00:00:05.000\n[Không thể tải phụ đề gốc từ Mux]", {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // If the target language is English, just return the original Mux subtitle
  if (lang === "en") {
    return new Response(vttContent, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Call OpenRouter AI to translate the WebVTT
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(vttContent, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const SYSTEM_PROMPT = `
You are an expert subtitle translator. Translate the following WebVTT subtitles into the requested language: ${targetLanguage}.
Rules:
1. You MUST keep all timestamps (e.g. 00:00:12.000 --> 00:00:15.000) and WebVTT cue markings EXACTLY as they are.
2. DO NOT change the arrows (-->), do not translate the numbers or formatting tags.
3. Translate the actual cue text accurately, maintaining a natural flow and tone in the target language.
4. DO NOT add any markdown formatting, code blocks (like \`\`\`vtt), conversational filler, or notes. Return ONLY the raw translated WebVTT content starting with the word 'WEBVTT'.
`;

  try {
    console.log(`[SUBTITLE_TRANSLATION] Translating WebVTT to ${targetLanguage} for video: ${videoId}`);
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: vttContent.slice(0, 12000) }, // safe limits for token contexts
        ],
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      let translatedVtt = aiData.choices?.[0]?.message?.content?.trim();
      
      if (translatedVtt) {
        // Strip any markdown code blocks
        translatedVtt = translatedVtt.replace(/```vtt|```/gi, "").trim();

        // Save to cache
        try {
          await redis.set(cacheKey, translatedVtt, { ex: 60 * 60 * 24 * 7 }); // 7 days expiration
          console.log(`[SUBTITLE_TRANSLATION] Cached translation successfully for ${lang}`);
        } catch (cacheError) {
          console.error("[SUBTITLE_TRANSLATION] Cache save error:", cacheError);
        }

        return new Response(translatedVtt, {
          headers: {
            "Content-Type": "text/vtt; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } else {
      const err = await aiResponse.text();
      console.error("[SUBTITLE_TRANSLATION] OpenRouter error:", err);
    }
  } catch (aiError) {
    console.error("[SUBTITLE_TRANSLATION] AI Translation call failed:", aiError);
  }

  // Fallback to original subtitle if AI translation fails
  return new Response(vttContent, {
    headers: {
      "Content-Type": "text/vtt; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
