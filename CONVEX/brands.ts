import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { voiceProfileV } from "./lib/validators";

export const create = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    description: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) throw new Error("Brand name is required");
    return await ctx.db.insert("brands", {
      ...args,
      name: args.name.trim(),
      industry: args.industry.trim(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("brands").order("desc").take(50),
});

export const get = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, { brandId }) => {
    const brand = await ctx.db.get(brandId);
    if (!brand) return null;
    return {
      ...brand,
      logoUrl: brand.logoStorageId
        ? await ctx.storage.getUrl(brand.logoStorageId)
        : null,
    };
  },
});

export const setVoiceProfile = internalMutation({
  args: { brandId: v.id("brands"), voiceProfile: voiceProfileV },
  handler: async (ctx, { brandId, voiceProfile }) => {
    await ctx.db.patch(brandId, { voiceProfile });
  },
});
