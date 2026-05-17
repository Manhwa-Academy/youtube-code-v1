/**
 * Utility to generate text embeddings using OpenRouter APIs.
 * Supports fallback to nomic embed model and mock vector as a final fail-safe.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not defined, returning mock embedding");
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  // Clean the input text
  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000); // limit length to avoid token limit errors

  if (!cleanedText) {
    return Array.from({ length: 1536 }, () => 0);
  }

  try {
    console.log(`Generating embedding for text: "${cleanedText.slice(0, 40)}..."`);
    
    // Attempt 1: OpenAI text-embedding-3-small via OpenRouter
    const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: cleanedText,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.[0]?.embedding) {
        return data.data[0].embedding;
      }
    }

    console.warn("OpenAI embedding failed on OpenRouter, trying nomic-embed-text fallback...");

    // Attempt 2: nomic-ai/nomic-embed-text
    const resFallback = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "nomic-ai/nomic-embed-text",
        input: cleanedText,
      }),
    });

    if (resFallback.ok) {
      const data = await resFallback.json();
      if (data?.data?.[0]?.embedding) {
        // Nomic embeds might be shorter, let's pad it to 1536 dimension if needed
        const embedding: number[] = data.data[0].embedding;
        if (embedding.length === 1536) {
          return embedding;
        } else if (embedding.length < 1536) {
          const padded = [...embedding];
          while (padded.length < 1536) padded.push(0);
          return padded;
        } else {
          return embedding.slice(0, 1536);
        }
      }
    }

    const errText = await res.text();
    console.error("All embedding models failed on OpenRouter. Raw error:", errText);
  } catch (error) {
    console.error("Error in getEmbedding:", error);
  }

  // Fail-safe fallback: generate a mock deterministic embedding based on the text hash
  console.warn("Using mock deterministic embedding as fail-safe fallback.");
  let hash = 0;
  for (let i = 0; i < cleanedText.length; i++) {
    hash = cleanedText.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Array.from({ length: 1536 }, (_, index) => {
    const value = Math.sin(hash + index) * 0.5;
    return value;
  });
}
