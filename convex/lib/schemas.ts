import { z } from "zod";
import { PLATFORMS } from "./platforms";

export const VoiceProfileSchema = z.object({
  summary: z.string(),
  tone: z.array(z.string()),
  vocabulary: z.array(z.string()),
  avoid: z.array(z.string()),
  emojiUsage: z.string(),
  sentenceStyle: z.string(),
  hashtagStyle: z.string(),
});

export const WriterOutputSchema = z.object({
  posts: z.array(
    z.object({
      platform: z.enum(PLATFORMS),
      caption: z.string().min(1),
      hashtags: z.array(z.string()),
      imagePrompt: z.string().min(1),
    }),
  ),
});

export const TrendOutputSchema = z.object({
  topics: z.array(z.string()),
  hashtags: z.array(z.string()),
});
