export const PLATFORMS = ["instagram", "linkedin", "x"] as const;
export type Platform = (typeof PLATFORMS)[number];

type PlatformRule = {
  label: string;
  maxChars: number; // caption + hashtags combined
  maxHashtags: number;
  image: { width: number; height: number };
  guide: string;
};

export const PLATFORM_RULES: Record<Platform, PlatformRule> = {
  instagram: {
    label: "Instagram",
    maxChars: 2200,
    maxHashtags: 15,
    image: { width: 1024, height: 1024 },
    guide:
      "Hook in the first line. Warm, visual, conversational. Short paragraphs, emojis only if the brand voice uses them. End with a call to action.",
  },
  linkedin: {
    label: "LinkedIn",
    maxChars: 3000,
    maxHashtags: 5,
    image: { width: 1216, height: 640 },
    guide:
      "Professional but human. Strong first line, short paragraphs with line breaks, a concrete insight or takeaway, end with a question or CTA.",
  },
  x: {
    label: "X",
    maxChars: 280,
    maxHashtags: 2,
    image: { width: 1344, height: 768 },
    guide:
      "Punchy and direct. Must fit in 280 characters INCLUDING hashtags. One idea only.",
  },
};
