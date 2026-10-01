import { PLATFORM_RULES, type Platform } from "./platforms";

/** Strip #, spaces and punctuation; dedupe; keep order. */
export function normalizeHashtags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const clean = raw.replace(/[^\p{L}\p{N}_]/gu, "");
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      out.push(clean);
    }
  }
  return out;
}

/** Automatic review flags — these feed the "review-flag rate" metric. */
export function computeReviewFlags(
  platform: Platform,
  caption: string,
  hashtags: string[],
): string[] {
  const rules = PLATFORM_RULES[platform];
  const flags: string[] = [];
  const full = [caption, hashtags.map((h) => `#${h}`).join(" ")]
    .join(" ")
    .trim();

  if (!caption.trim()) flags.push("empty_caption");
  if (full.length > rules.maxChars) flags.push("over_length");
  if (hashtags.length > rules.maxHashtags) flags.push("too_many_hashtags");
  if (hashtags.length === 0) flags.push("no_hashtags");
  if (/\[[^\]]*\]|lorem ipsum|as an ai/i.test(caption))
    flags.push("placeholder_or_ai_leak");
  return flags;
}
