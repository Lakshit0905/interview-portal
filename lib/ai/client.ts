import "server-only";

export interface LLMMessage { role: "user" | "assistant"; content: string }

export const AI_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY);

/**
 * Thin wrapper over the Anthropic Messages API. Returns plain text.
 * Throws if no key is configured — callers should catch and fall back.
 */
export async function llm(system: string, messages: LLMMessage[], maxTokens = 1200): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("AI_DISABLED");
  const model = process.env.AI_MODEL || "claude-sonnet-4-20250514";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) throw new Error(`AI_HTTP_${res.status}`);
  const data = await res.json();
  return (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n")
    .trim();
}

/** Parse a JSON object/array out of an LLM response that may be fenced. */
export function parseJson<T>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const start = Math.min(...[clean.indexOf("{"), clean.indexOf("[")].filter((i) => i >= 0));
    return JSON.parse(clean.slice(start)) as T;
  } catch {
    return fallback;
  }
}
