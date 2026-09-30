"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { groqJson, MODELS } from "./client";
import { writerPrompt } from "./prompts";
import { generateImage } from "./imageGen";
import { WriterOutputSchema } from "../lib/schemas";
import { PLATFORM_RULES } from "../lib/platforms";
import { computeReviewFlags, normalizeHashtags } from "../lib/guards";

const IMAGE_STYLE =
  "Clean, modern social media graphic, high quality, no text, no letters, no logos, no watermark.";

/** Rewrite one post's caption + hashtags. Optional instruction, e.g. "make it funnier". */
export const caption = action({
  args: { postId: v.id("posts"), instruction: v.optional(v.string()) },
  handler: async (ctx, { postId, instruction }): Promise<void> => {
    const data = await ctx.runQuery(internal.posts.getForRegen, { postId });
    if (!data) throw new Error("Post not found");
    const { post, brand, brief, examples } = data;

    const notes = [
      brief.notes,
      instruction ? `REWRITE INSTRUCTION: ${instruction}` : undefined,
      `Write a clearly different version from this earlier draft: "${post.caption}"`,
    ]
      .filter(Boolean)
      .join("\n");

    const { system, user } = writerPrompt({
      brandName: brand.name,
      industry: brand.industry,
      description: brand.description,
      voice: brand.voiceProfile,
      examples,
      topic: brief.topic,
      notes,
      platforms: [post.platform],
      trends: { topics: [], hashtags: [] },
    });
    const out = await groqJson({
      model: MODELS.writer,
      system,
      user,
      schema: WriterOutputSchema,
      temperature: 0.9,
    });
    const d = out.posts.find((p) => p.platform === post.platform) ?? out.posts[0];
    if (!d) throw new Error("Writer returned nothing");

    const hashtags = normalizeHashtags(d.hashtags).slice(
      0,
      PLATFORM_RULES[post.platform].maxHashtags,
    );
    await ctx.runMutation(internal.posts.applyRegen, {
      postId,
      caption: d.caption.trim(),
      hashtags,
      reviewFlags: computeReviewFlags(post.platform, d.caption, hashtags),
    });
  },
});

/** Regenerate one post's image. Pass `imagePrompt` to change the visual idea. */
export const image = action({
  args: { postId: v.id("posts"), imagePrompt: v.optional(v.string()) },
  handler: async (ctx, { postId, imagePrompt }): Promise<void> => {
    const data = await ctx.runQuery(internal.posts.getForRegen, { postId });
    if (!data) throw new Error("Post not found");
    const { post } = data;

    const prompt = imagePrompt?.trim() || post.imagePrompt;
    try {
      const blob = await generateImage(
        `${prompt}. ${IMAGE_STYLE}`,
        PLATFORM_RULES[post.platform].image,
      );
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.posts.setImage, {
        postId,
        storageId,
        imagePrompt: imagePrompt?.trim() || undefined,
      });
    } catch (e) {
      await ctx.runMutation(internal.posts.setImageError, {
        postId,
        error: e instanceof Error ? e.message : "Image generation failed",
      });
    }
  },
});