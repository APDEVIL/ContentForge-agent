import Groq from "groq-sdk";
import type { ZodType } from "zod";

// Groq's Llama models moved to Enterprise-only. These two are the self-serve
// production models. Override without a code change:
//   bunx convex env set GROQ_WRITER_MODEL <model-id>
//   bunx convex env set GROQ_FAST_MODEL <model-id>
// Current list: console.groq.com/docs/models
export const MODELS = {
  get writer() {
    return process.env.GROQ_WRITER_MODEL ?? "openai/gpt-oss-120b";
  },
  get fast() {
    return process.env.GROQ_FAST_MODEL ?? "openai/gpt-oss-20b";
  },
};

let client: Groq | null = null;
export function groq(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set in Convex env");
    // maxRetries handles 429 rate limits with backoff
    client = new Groq({ apiKey, maxRetries: 4 });
  }
  return client;
}

type ChatResult = {
  choices: { message?: { content?: string | null } }[];
};

function statusOf(e: unknown): number | undefined {
  return typeof e === "object" && e !== null && "status" in e
    ? (e as { status?: number }).status
    : undefined;
}

/** Calls Groq in JSON mode and validates the result with zod (retries on bad JSON). */
export async function groqJson<T>(opts: {
  model: string;
  system: string;
  user: string;
  schema: ZodType<T>;
  temperature?: number;
  maxAttempts?: number;
}): Promise<T> {
  const { model, system, user, schema, temperature = 0.7, maxAttempts = 4 } =
    opts;
  let lastError = "";
  // JSON mode + reasoning options. Turned off if the model rejects them (HTTP 400).
  let strict = true;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const params: Record<string, unknown> = {
      model,
      temperature,
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `${system}\n\nRespond with a single valid JSON object only. No markdown, no commentary.`,
        },
        {
          role: "user",
          content:
            attempt === 1 || !lastError
              ? user
              : `${user}\n\nYour previous reply was invalid (${lastError}). Return corrected JSON only.`,
        },
      ],
    };
    if (strict) {
      params.response_format = { type: "json_object" };
      // gpt-oss are reasoning models: keep thinking short and out of the reply
      params.reasoning_effort = "low";
      params.include_reasoning = false;
    }

    let text = "";
    try {
      const completion = (await groq().chat.completions.create(
        params as never,
      )) as unknown as ChatResult;
      text = completion.choices[0]?.message?.content ?? "";
    } catch (e) {
      if (statusOf(e) === 400 && strict) {
        strict = false; // retry without the optional parameters
        lastError = "";
        continue;
      }
      throw e;
    }

    try {
      // tolerate a stray ```json fence
      const cleaned = text
        .replace(/^\s*```(?:json)?/i, "")
        .replace(/```\s*$/, "")
        .trim();
      return schema.parse(JSON.parse(cleaned));
    } catch (e) {
      lastError = e instanceof Error ? e.message.slice(0, 300) : "invalid JSON";
    }
  }
  throw new Error(
    `Groq returned invalid JSON after ${maxAttempts} attempts: ${lastError}`,
  );
}