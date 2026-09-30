"use node";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { groqJson, MODELS } from "./client";
import { writerPrompt } from "./prompts";
import { fetchTrends } from "./trendSources";
import { generateImage } from "./imageGen";
import { WriterOutputSchema } from "../lib/schemas";
import { PLATFORM_RULES, type Platform } from "../lib/platforms";
import { computeReviewFlags, normalizeHashtags } from "../lib/guards";

const TREND_TTL_MS = 6 * 60 * 60 * 1000;
const IMAGE_STYLE =
  "Clean, modern social media graphic, high quality, no text, no letters, no logos, no watermark.";

/** The agent chain: brand voice → trends → writer → guards → images. */
export const run = internalAction({
  args: { packId: v.id("contentPacks") },
  handler: async (ctx, { packId }): Promise<void> => {
    try {
      const data = await ctx.runQuery(internal.contentPacks.getContext, {
        packId,
      });
      if (!data) throw new Error("Content pack not found");
      const { brief, brand, examples } = data;

      // 1) Trends (cached 6h)
      await ctx.runMutation(internal.contentPacks.setStage, {
        packId,
        stage: "Finding trends & hashtags",
      });
      const key = `${brand.industry}:${brief.topic}`.toLowerCase().slice(0, 120);
      const cached = await ctx.runQuery(internal.trends.getFresh, {
        key,
        maxAgeMs: TREND_TTL_MS,
      });
      let trends: { topics: string[]; hashtags: string[] };
      if (cached) {
        trends = { topics: cached.topics, hashtags: cached.hashtags };
      } else {
        trends = await fetchTrends({
          topic: brief.topic,
          industry: brand.industry,
        });
        await ctx.runMutation(internal.trends.upsert, { key, ...trends });
      }
      await ctx.runMutation(internal.contentPacks.setTrends, {
        packId,
        trendTopics: trends.topics,
        trendHashtags: trends.hashtags,
      });

      // 2) Writer
      await ctx.runMutation(internal.contentPacks.setStage, {
        packId,
        stage: "Writing captions",
      });
      const { system, user } = writerPrompt({
        brandName: brand.name,
        industry: brand.industry,
        description: brand.description,
        voice: brand.voiceProfile,
        examples,
        topic: brief.topic,
        notes: brief.notes,
        platforms: brief.platforms,
        trends,
      });
      const out = await groqJson({
        model: MODELS.writer,
        system,
        user,
        schema: WriterOutputSchema,
        temperature: 0.8,
      });

      // keep only requested platforms, one per platform
      const seen = new Set<Platform>();
      const drafts = [];
      for (const d of out.posts) {
        if (brief.platforms.includes(d.platform) && !seen.has(d.platform)) {
          seen.add(d.platform);
          drafts.push(d);
        }
      }
      if (drafts.length === 0) throw new Error("Writer returned no usable posts");

      // 3) Save captions first so the UI can show them right away
      const created: {
        postId: Id<"posts">;
        platform: Platform;
        imagePrompt: string;
      }[] = [];
      for (const d of drafts) {
        const hashtags = normalizeHashtags(d.hashtags).slice(
          0,
          PLATFORM_RULES[d.platform].maxHashtags,
        );
        const postId = await ctx.runMutation(internal.posts.insert, {
          packId,
          brandId: brand._id,
          platform: d.platform,
          caption: d.caption.trim(),
          hashtags,
          imagePrompt: d.imagePrompt,
          reviewFlags: computeReviewFlags(d.platform, d.caption, hashtags),
        });
        created.push({
          postId,
          platform: d.platform,
          imagePrompt: d.imagePrompt,
        });
      }

      // 4) Images (one failing image never fails the whole pack)
      await ctx.runMutation(internal.contentPacks.setStage, {
        packId,
        stage: "Creating visuals",
      });
      await Promise.all(
        created.map(async (c) => {
          try {
            const blob = await generateImage(
              `${c.imagePrompt}. ${IMAGE_STYLE}`,
              PLATFORM_RULES[c.platform].image,
            );
            const storageId = await ctx.storage.store(blob);
            await ctx.runMutation(internal.posts.setImage, {
              postId: c.postId,
              storageId,
            });
          } catch (e) {
            await ctx.runMutation(internal.posts.setImageError, {
              postId: c.postId,
              error: e instanceof Error ? e.message : "Image generation failed",
            });
          }
        }),
      );

      await ctx.runMutation(internal.contentPacks.setReady, { packId });
    } catch (e) {
      await ctx.runMutation(internal.contentPacks.setFailed, {
        packId,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  },
});
