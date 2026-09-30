import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getFresh = internalQuery({
  args: { key: v.string(), maxAgeMs: v.number() },
  handler: async (ctx, { key, maxAgeMs }) => {
    const t = await ctx.db
      .query("trends")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!t || Date.now() - t.fetchedAt > maxAgeMs) return null;
    return t;
  },
});

export const upsert = internalMutation({
  args: {
    key: v.string(),
    topics: v.array(v.string()),
    hashtags: v.array(v.string()),
  },
  handler: async (ctx, { key, topics, hashtags }) => {
    const existing = await ctx.db
      .query("trends")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    const doc = { key, topics, hashtags, fetchedAt: Date.now() };
    if (existing) await ctx.db.replace(existing._id, doc);
    else await ctx.db.insert("trends", doc);
  },
});
