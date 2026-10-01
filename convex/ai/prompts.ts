import { PLATFORM_RULES, type Platform } from "../lib/platforms";

export type VoiceProfile = {
  summary: string;
  tone: string[];
  vocabulary: string[];
  avoid: string[];
  emojiUsage: string;
  sentenceStyle: string;
  hashtagStyle: string;
};

export function voiceAnalysisPrompt(posts: string[]) {
  const system = `You are a brand strategist who reverse-engineers a brand's writing voice from its past social media posts.
Return JSON with exactly these keys:
{
  "summary": "2-3 sentence description of the voice",
  "tone": ["3-5 adjectives"],
  "vocabulary": ["up to 10 signature words or phrases actually used"],
  "avoid": ["things this brand would never say or do"],
  "emojiUsage": "none | rare | moderate | heavy, plus how they are used",
  "sentenceStyle": "length, rhythm, punctuation habits",
  "hashtagStyle": "how many, what kind, where placed"
}
Base everything ONLY on the posts provided. Do not invent traits.`;

  const user = `Past posts:\n\n${posts.map((p, i) => `${i + 1}. ${p}`).join("\n\n")}`;
  return { system, user };
}

export function writerPrompt(a: {
  brandName: string;
  industry: string;
  description?: string;
  voice?: VoiceProfile;
  examples: string[];
  topic: string;
  notes?: string;
  platforms: Platform[];
  trends: { topics: string[]; hashtags: string[] };
}) {
  const system = `You are a senior social media copywriter. You write ready-to-post content that sounds exactly like the brand.
Return JSON in this shape:
{"posts":[{"platform":"instagram|linkedin|x","caption":"...","hashtags":["word1","word2"],"imagePrompt":"..."}]}

Rules:
- Exactly one post per requested platform, no extras.
- "caption" must NOT contain hashtags. "hashtags" are plain words without the # symbol.
- Respect each platform's limits (caption + hashtags combined) and style guide.
- "imagePrompt": a concrete 1-2 sentence description of a visual that matches the post. The image must contain NO text, letters, logos or watermarks.
- Never invent facts, statistics, prices, discounts, or claims that are not in the brief.
- No placeholders like [link] or [name].
- Use trending topics/hashtags only when genuinely relevant.`;

  const platformBlock = a.platforms
    .map((p) => {
      const r = PLATFORM_RULES[p];
      return `- ${p}: max ${r.maxChars} chars, max ${r.maxHashtags} hashtags. ${r.guide}`;
    })
    .join("\n");

  const voiceBlock = a.voice
    ? JSON.stringify(a.voice, null, 2)
    : "No voice profile yet — write in a clear, friendly, professional tone.";

  const examplesBlock = a.examples.length
    ? a.examples.map((e, i) => `Example ${i + 1}:\n${e}`).join("\n\n")
    : "None provided.";

  const user = `BRAND: ${a.brandName} (${a.industry})
${a.description ? `ABOUT: ${a.description}\n` : ""}
VOICE PROFILE:
${voiceBlock}

PAST POSTS (match this voice):
${examplesBlock}

BRIEF / TOPIC:
${a.topic}
${a.notes ? `\nEXTRA NOTES:\n${a.notes}\n` : ""}
TRENDING TOPICS: ${a.trends.topics.join("; ") || "none"}
TRENDING HASHTAGS: ${a.trends.hashtags.join(", ") || "none"}

PLATFORMS:
${platformBlock}`;

  return { system, user };
}
