import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  packStatusV,
  platformV,
  postStatusV,
  voiceProfileV,
} from "./lib/validators";

export default defineSchema({
  brands: defineTable({
    name: v.string(),
    industry: v.string(),
    description: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    voiceProfile: v.optional(voiceProfileV),
  }),

  brandPosts: defineTable({
    brandId: v.id("brands"),
    platform: v.optional(platformV),
    text: v.string(),
  }).index("by_brand", ["brandId"]),

  briefs: defineTable({
    brandId: v.id("brands"),
    topic: v.string(),
    notes: v.optional(v.string()),
    platforms: v.array(platformV),
  }),

  contentPacks: defineTable({
    briefId: v.id("briefs"),
    brandId: v.id("brands"),
    status: packStatusV,
    stage: v.string(),
    error: v.optional(v.string()),
    trendTopics: v.optional(v.array(v.string())),
    trendHashtags: v.optional(v.array(v.string())),
  }).index("by_brand", ["brandId"]),

  posts: defineTable({
    packId: v.id("contentPacks"),
    brandId: v.id("brands"),
    platform: platformV,
    caption: v.string(),
    hashtags: v.array(v.string()),
    imagePrompt: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    imageError: v.optional(v.string()),
    status: postStatusV,
    reviewFlags: v.array(v.string()),
  }).index("by_pack", ["packId"]),

  trends: defineTable({
    key: v.string(),
    topics: v.array(v.string()),
    hashtags: v.array(v.string()),
    fetchedAt: v.number(),
  }).index("by_key", ["key"]),

  calendarSlots: defineTable({
    postId: v.id("posts"),
    brandId: v.id("brands"),
    scheduledFor: v.number(),
  })
    .index("by_brand_date", ["brandId", "scheduledFor"])
    .index("by_post", ["postId"]),

      evalRuns: defineTable({
    name: v.string(),
    status: v.union(v.literal("running"), v.literal("done"), v.literal("failed")),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    baselineMinutes: v.number(),
  }),

  evalItems: defineTable({
    runId: v.id("evalRuns"),
    brandId: v.id("brands"),
    industry: v.string(),
    topic: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("done"),
      v.literal("failed"),
    ),
    packId: v.optional(v.id("contentPacks")),
    seconds: v.optional(v.number()),
    voiceRating: v.optional(v.number()),
  }).index("by_run_status", ["runId", "status"]),
});

