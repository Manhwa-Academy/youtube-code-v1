/**
 * Utility to generate text embeddings.
 * 
 * Supports three layers of generation:
 * 1. Google Gemini API (text-embedding-004): 100% FREE AI embedding model from Google,
 *    natively outputting 1536 dimensions using Matryoshka Representation Learning (MRL).
 *    To use this, simply add GEMINI_API_KEY to your .env file!
 * 
 * 2. OpenAI / OpenRouter (text-embedding-3-small): Paid model, used if explicitly enabled
 *    via USE_PAID_EMBEDDINGS=true and OPENROUTER_API_KEY is present.
 * 
 * 3. Local Free Feature Hashing (Bag-of-Words & Bigram VSM): Fully offline, zero cost fail-safe.
 */

// A comprehensive set of English and Vietnamese stop words to filter out noise
const STOP_WORDS = new Set([
  // English stop words
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "cant", "cannot", "could", "couldnt",
  "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during",
  "each",
  "few", "for", "from", "further",
  "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how", "hows",
  "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself",
  "lets",
  "me", "more", "most", "mustnt", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such",
  "than", "that", "thats", "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll", "theyre", "theyve", "this", "those", "through", "to", "too",
  "under", "until", "up",
  "very",
  "was", "wasnt", "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres", "which", "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt",
  "you", "youd", "youll", "youre", "youve", "your", "yours", "yourself", "yourselves",

  // Vietnamese stop words
  "và", "là", "thì", "mà", "nhưng", "hoặc", "cho", "của", "được", "bị", "bởi", "tại", "trong", "ngoài", "trên", "dưới",
  "với", "như", "những", "các", "này", "kia", "đó", "ấy", "thế", "nào", "gì", "ai", "đâu", "khi", "lúc", "nơi", "sự",
  "cuộc", "việc", "cái", "con", "chiếc", "tấm", "bản", "người", "nhà", "phòng", "ban", "bộ", "đội", "nhóm", "tổ"
]);

// Classic robust djb2 string hashing algorithm
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const usePaidEmbeddings = process.env.USE_PAID_EMBEDDINGS === "true";

  // Clean the input text
  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000); // limit length to avoid token limit errors

  if (!cleanedText) {
    return Array.from({ length: 1536 }, () => 0);
  }

  // ==========================================
  // 1. FREE Google Gemini API (gemini-embedding-001)
  // ==========================================
  if (geminiApiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: {
            parts: [{ text: cleanedText }]
          },
          outputDimensionality: 1536
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.embedding?.values && data.embedding.values.length === 1536) {
          return data.embedding.values;
        }
      } else {
        console.warn(`Gemini Embedding API returned status ${res.status}:`, await res.text());
      }
    } catch (err) {
      console.error("Error calling Google Gemini Embedding API:", err);
    }
  } else {
    console.warn(
      "No GEMINI_API_KEY found in environmental variables.\n" +
      "👉 Tip: To get a 100% FREE high-quality AI Embedding model from Google, generate a free API Key from Google AI Studio and add GEMINI_API_KEY to your .env file!"
    );
  }

  // ==========================================
  // 2. Paid OpenAI text-embedding-3-small via OpenRouter
  // ==========================================
  if (usePaidEmbeddings && openRouterApiKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterApiKey}`,
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
    } catch (err) {
      console.error("Error generating paid embedding:", err);
    }
  }

  // ==========================================
  // 3. Local Free Feature Hashing Fallback (Deterministic Bag-of-Words & Bigram VSM)
  // ==========================================
  console.warn("Falling back to local Feature Hashing embedding.");
  const vector = Array.from({ length: 1536 }, () => 0);
  
  const words = cleanedText
    .toLowerCase()
    .split(/[\s,.\-!?_#@/()]+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) {
    let hash = djb2Hash(cleanedText);
    for (let i = 0; i < 1536; i++) {
      vector[i] = Math.sin(hash + i);
    }
  } else {
    for (const word of words) {
      const hash = djb2Hash(word);
      const index = Math.abs(hash) % 1536;
      vector[index] += 1.0;
    }

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]}_${words[i + 1]}`;
      const hash = djb2Hash(bigram);
      const index = Math.abs(hash) % 1536;
      vector[index] += 1.5;
    }
  }

  let sumSq = 0;
  for (let i = 0; i < 1536; i++) {
    sumSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSq);

  if (magnitude > 0) {
    for (let i = 0; i < 1536; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}
