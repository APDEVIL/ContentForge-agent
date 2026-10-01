"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { groqJson, MODELS } from "./client";
import { voiceAnalysisPrompt, type VoiceProfile } from "./prompts";
import { VoiceProfileSchema } from "../lib/schemas";

/** Learns a brand's voice from its uploaded past posts (needs >= 3). */
export const analyze = action({
  args: { brandId: v.id("brands") },
  handler: async (ctx, { brandId }): Promise<VoiceProfile> => {
    const posts = await ctx.runQuery(internal.brandPosts.listForBrand, {
      brandId,
      limit: 30,
    });
    if (posts.length < 3) {
      throw new Error("Add at least 3 past posts so we can learn the voice.");
    }
    const { system, user } = voiceAnalysisPrompt(posts.map((p) => p.text));
    const profile = await groqJson({
      model: MODELS.writer,
      system,
      user,
      schema: VoiceProfileSchema,
      temperature: 0.3,
    });
    await ctx.runMutation(internal.brands.setVoiceProfile, {
      brandId,
      voiceProfile: profile,
    });
    return profile;
  },
});
