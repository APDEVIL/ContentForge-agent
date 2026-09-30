import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { platformV } from "./lib/validators";

/** Submit a brief → creates a pack and kicks off generation in the background. */
export const submit = mutation({
  args: {
    brandId: v.id("brands"),
    topic: v.string(),
    platforms: v.array(platformV),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const topic = args.topic.trim();
    if (topic.length < 3) throw new Error("Topic is too short");
    const platforms = Array.from(new Set(args.platforms));
    if (platforms.length === 0) throw new Error("Pick at least one platform");
    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error("Brand not found");

    const briefId = await ctx.db.insert("briefs", {
      brandId: args.brandId,
      topic,
      platforms,
      notes: args.notes?.trim() || undefined,
    });
    const packId = await ctx.db.insert("contentPacks", {
      briefId,
      brandId: args.brandId,
      status: "generating",
      stage: "Queued",
    });
    await ctx.scheduler.runAfter(0, internal.ai.generatePack.run, { packId });
    return packId;
  },
});
