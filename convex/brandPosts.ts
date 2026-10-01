import { v } from "convex/values";
import {
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { platformV } from "./lib/validators";

export const add = mutation({
  args: {
    brandId: v.id("brands"),
    text: v.string(),
    platform: v.optional(platformV),
  },
  handler: async (ctx, { brandId, text, platform }) => {
    if (text.trim().length < 10) throw new Error("Post text is too short");
    return await ctx.db.insert("brandPosts", {
      brandId,
      text: text.trim(),
      platform,
    });
  },
});

/** Paste many past posts at once. */
export const addMany = mutation({
  args: { brandId: v.id("brands"), texts: v.array(v.string()) },
  handler: async (ctx, { brandId, texts }) => {
    let count = 0;
    for (const t of texts) {
      if (t.trim().length >= 10) {
        await ctx.db.insert("brandPosts", { brandId, text: t.trim() });
        count++;
      }
    }
    return count;
  },
});

export const list = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, { brandId }) =>
    await ctx.db
      .query("brandPosts")
      .withIndex("by_brand", (q) => q.eq("brandId", brandId))
      .order("desc")
      .take(100),
});

export const remove = mutation({
  args: { postId: v.id("brandPosts") },
  handler: async (ctx, { postId }) => {
    await ctx.db.delete(postId);
  },
});

export const listForBrand = internalQuery({
  args: { brandId: v.id("brands"), limit: v.number() },
  handler: async (ctx, { brandId, limit }) =>
    await ctx.db
      .query("brandPosts")
      .withIndex("by_brand", (q) => q.eq("brandId", brandId))
      .order("desc")
      .take(limit),
});
