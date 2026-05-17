/**
 * Utility to moderate user-generated text using OpenRouter AI.
 * Determines if text contains toxicity, hate speech, severe harassment, scams, or spam.
 */
export async function moderateTextAI(
  text: string
): Promise<{ inappropriate: boolean; reason: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not defined, skipping AI moderation");
    return { inappropriate: false, reason: "" };
  }

  const cleanedText = text.trim();
  if (!cleanedText) {
    return { inappropriate: false, reason: "" };
  }

  const SYSTEM_PROMPT = `
You are a strict content moderation AI. Analyze the text provided by the user.
Determine if the text violates safety guidelines (hate speech, severe harassment, cyberbullying, extreme profanity, scams, spam, explicit sexual content, or graphic violence).
You MUST respond in strict JSON format with exactly two fields:
- "inappropriate": true if it violates safety guidelines, false otherwise.
- "reason": a brief explanation in Vietnamese of why it was flagged, or empty string if clean.
Example response: {"inappropriate": true, "reason": "Bình luận chứa từ ngữ thô tục quấy rối người khác."}
Do NOT include any markdown formatting, backticks, or conversational filler in your response. Output ONLY the raw JSON string.
`;

  try {
    console.log(`Moderating text with AI: "${cleanedText.slice(0, 45)}..."`);
    
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: cleanedText.slice(0, 4000) },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!res.ok) {
      console.warn("Moderation API failed, returning clean as fallback");
      return { inappropriate: false, reason: "" };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (content) {
      // Parse JSON safely
      const parsed = JSON.parse(content.replace(/```json|```/g, ""));
      return {
        inappropriate: !!parsed.inappropriate,
        reason: parsed.reason || "Phát hiện nội dung không phù hợp bởi AI.",
      };
    }
  } catch (error) {
    console.error("AI Content Moderation failed:", error);
  }

  return { inappropriate: false, reason: "" };
}
