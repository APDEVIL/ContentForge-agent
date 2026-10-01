import { v } from "convex/values";

export const platformV = v.union(
  v.literal("instagram"),
  v.literal("linkedin"),
  v.literal("x"),
);

export const postStatusV = v.union(
  v.literal("pending_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("scheduled"),
);

export const packStatusV = v.union(
  v.literal("generating"),
  v.literal("ready"),
  v.literal("failed"),
);

export const voiceProfileV = v.object({
  summary: v.string(),
  tone: v.array(v.string()),
  vocabulary: v.array(v.string()),
  avoid: v.array(v.string()),
  emojiUsage: v.string(),
  sentenceStyle: v.string(),
  hashtagStyle: v.string(),
});
