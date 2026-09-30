import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";

/** Live pack + posts (with image URLs). Subscribe to this from the UI. */
export const get = query({
  args: { packId: v.id("contentPacks") },
  handler: async (ctx, { packId }) => {
    const pack = await ctx.db.get(packId);
    if (!pack) return null;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_pack", (q) => q.eq("packId", packId))
      .collect();
    const withImages = await Promise.all(
      posts.map(async (p) => ({
        ...p,
        imageUrl: p.imageStorageId
          ? await ctx.storage.getUrl(p.imageStorageId)
          : null,
      })),
    );
    return { pack, posts: withImages };
  },
});

export const listByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, { brandId }) => {
    const packs = await ctx.db
      .query("contentPacks")
      .withIndex("by_brand", (q) => q.eq("brandId", brandId))
      .order("desc")
      .take(20);
    return await Promise.all(
      packs.map(async (p) => ({
        ...p,
        topic: (await ctx.db.get(p.briefId))?.topic ?? "",
      })),
    );
  },
});

export const getContext = internalQuery({
  args: { packId: v.id("contentPacks") },
  handler: async (ctx, { packId }) => {
    const pack = await ctx.db.get(packId);
    if (!pack) return null;
    const brief = await ctx.db.get(pack.briefId);
    const brand = await ctx.db.get(pack.brandId);
    if (!brief || !brand) return null;
    const examples = (
      await ctx.db
        .query("brandPosts")
        .withIndex("by_brand", (q) => q.eq("brandId", brand._id))
        .order("desc")
        .take(5)
    ).map((p) => p.text);
    return { pack, brief, brand, examples };
  },
});

export const setStage = internalMutation({
  args: { packId: v.id("contentPacks"), stage: v.string() },
  handler: async (ctx, { packId, stage }) => {
    await ctx.db.patch(packId, { stage });
  },
});

export const setTrends = internalMutation({
  args: {
    packId: v.id("contentPacks"),
    trendTopics: v.array(v.string()),
    trendHashtags: v.array(v.string()),
  },
  handler: async (ctx, { packId, ...rest }) => {
    await ctx.db.patch(packId, rest);
  },
});

export const setReady = internalMutation({
  args: { packId: v.id("contentPacks") },
  handler: async (ctx, { packId }) => {
    await ctx.db.patch(packId, { status: "ready", stage: "Ready for review" });
  },
});

export const setFailed = internalMutation({
  args: { packId: v.id("contentPacks"), error: v.string() },
  handler: async (ctx, { packId, error }) => {
    await ctx.db.patch(packId, { status: "failed", stage: "Failed", error });
  },
});
