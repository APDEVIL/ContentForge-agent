import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { EVAL_DATASET, EVAL_PLATFORMS } from "./lib/evalDataset";

const DEFAULT_BASELINE_MINUTES = 45; // assumed manual time for 3 platform posts + visuals
const REVIEW_MINUTES = 5; // assumed human review time per AI pack

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/* ---------- start a run ---------- */

export const seed = internalMutation({
  args: { name: v.string(), baselineMinutes: v.number() },
  handler: async (ctx, { name, baselineMinutes }) => {
    const runId = await ctx.db.insert("evalRuns", {
      name,
      status: "running",
      startedAt: Date.now(),
      baselineMinutes,
    });
    const brandIds: Id<"brands">[] = [];
    for (const b of EVAL_DATASET) {
      const brandId = await ctx.db.insert("brands", {
        name: b.name,
        industry: b.industry,
        description: b.description,
      });
      brandIds.push(brandId);
      for (const text of b.pastPosts) {
        await ctx.db.insert("brandPosts", { brandId, text });
      }
      for (const topic of b.topics) {
        await ctx.db.insert("evalItems", {
          runId,
          brandId,
          industry: b.industry,
          topic,
          status: "queued",
        });
      }
    }
    return { runId, brandIds };
  },
});

/** Creates 3 brands + 30 briefs, learns each brand's voice, then processes briefs one by one. */
export const start = action({
  args: {
    name: v.optional(v.string()),
    baselineMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Id<"evalRuns">> => {
    const { runId, brandIds } = await ctx.runMutation(internal.evaluation.seed, {
      name: args.name ?? `Eval ${new Date().toISOString()}`,
      baselineMinutes: args.baselineMinutes ?? DEFAULT_BASELINE_MINUTES,
    });
    try {
      for (const brandId of brandIds) {
        await ctx.runAction(api.ai.brandVoice.analyze, { brandId });
      }
    } catch (e) {
      await ctx.runMutation(internal.evaluation.finishRun, {
        runId,
        status: "failed",
      });
      throw e;
    }
    await ctx.scheduler.runAfter(0, internal.evaluation.processNext, { runId });
    return runId;
  },
});

/* ---------- worker (one brief per invocation, avoids the action time limit) ---------- */

export const claimNext = internalMutation({
  args: { runId: v.id("evalRuns") },
  handler: async (ctx, { runId }) => {
    const item = await ctx.db
      .query("evalItems")
      .withIndex("by_run_status", (q) => q.eq("runId", runId).eq("status", "queued"))
      .first();
    if (!item) return null;

    const briefId = await ctx.db.insert("briefs", {
      brandId: item.brandId,
      topic: item.topic,
      platforms: EVAL_PLATFORMS,
    });
    const packId = await ctx.db.insert("contentPacks", {
      briefId,
      brandId: item.brandId,
      status: "generating",
      stage: "Queued",
    });
    await ctx.db.patch(item._id, { status: "running", packId });
    return { itemId: item._id, packId };
  },
});

export const packStatus = internalQuery({
  args: { packId: v.id("contentPacks") },
  handler: async (ctx, { packId }) => (await ctx.db.get(packId))?.status ?? null,
});

export const completeItem = internalMutation({
  args: { itemId: v.id("evalItems"), seconds: v.number(), ok: v.boolean() },
  handler: async (ctx, { itemId, seconds, ok }) => {
    await ctx.db.patch(itemId, { seconds, status: ok ? "done" : "failed" });
  },
});

export const finishRun = internalMutation({
  args: {
    runId: v.id("evalRuns"),
    status: v.union(v.literal("done"), v.literal("failed")),
  },
  handler: async (ctx, { runId, status }) => {
    await ctx.db.patch(runId, { status, finishedAt: Date.now() });
  },
});

export const processNext = internalAction({
  args: { runId: v.id("evalRuns") },
  handler: async (ctx, { runId }): Promise<void> => {
    const item = await ctx.runMutation(internal.evaluation.claimNext, { runId });
    if (!item) {
      await ctx.runMutation(internal.evaluation.finishRun, {
        runId,
        status: "done",
      });
      return;
    }
    const t0 = Date.now();
    let ok = false;
    try {
      await ctx.runAction(internal.ai.generatePack.run, { packId: item.packId });
      ok =
        (await ctx.runQuery(internal.evaluation.packStatus, {
          packId: item.packId,
        })) === "ready";
    } catch {
      ok = false;
    }
    await ctx.runMutation(internal.evaluation.completeItem, {
      itemId: item.itemId,
      seconds: (Date.now() - t0) / 1000,
      ok,
    });
    // small pause to stay inside Groq free-tier rate limits
    await ctx.scheduler.runAfter(1500, internal.evaluation.processNext, { runId });
  },
});

/* ---------- human rating + results ---------- */

/** Rate how well a pack matches the brand voice (1-5). */
export const rate = mutation({
  args: { itemId: v.id("evalItems"), rating: v.number() },
  handler: async (ctx, { itemId, rating }) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      throw new Error("Rating must be an integer from 1 to 5");
    await ctx.db.patch(itemId, { voiceRating: rating });
  },
});

export const items = query({
  args: { runId: v.id("evalRuns") },
  handler: async (ctx, { runId }) =>
    await ctx.db
      .query("evalItems")
      .withIndex("by_run_status", (q) => q.eq("runId", runId))
      .collect(),
});

export const listRuns = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("evalRuns").order("desc").take(10),
});

/** The numbers for your results slide. */
export const report = query({
  args: { runId: v.id("evalRuns") },
  handler: async (ctx, { runId }) => {
    const run = await ctx.db.get(runId);
    if (!run) return null;
    const items = await ctx.db
      .query("evalItems")
      .withIndex("by_run_status", (q) => q.eq("runId", runId))
      .collect();

    const stats = new Map<
      string,
      {
        briefs: number;
        done: number;
        seconds: number;
        ratings: number[];
        posts: number;
        flagged: number;
      }
    >();

    for (const it of items) {
      const s =
        stats.get(it.industry) ??
        { briefs: 0, done: 0, seconds: 0, ratings: [], posts: 0, flagged: 0 };
      s.briefs++;
      if (it.status === "done") {
        s.done++;
        s.seconds += it.seconds ?? 0;
        if (it.packId) {
          const posts = await ctx.db
            .query("posts")
            .withIndex("by_pack", (q) => q.eq("packId", it.packId!))
            .collect();
          s.posts += posts.length;
          s.flagged += posts.filter((p) => p.reviewFlags.length > 0).length;
        }
      }
      if (it.voiceRating !== undefined) s.ratings.push(it.voiceRating);
      stats.set(it.industry, s);
    }

    const all = Array.from(stats.values());
    const sum = (f: (s: (typeof all)[number]) => number) =>
      all.reduce((a, s) => a + f(s), 0);
    const done = sum((s) => s.done);
    const seconds = sum((s) => s.seconds);
    const posts = sum((s) => s.posts);
    const flagged = sum((s) => s.flagged);
    const ratings = all.flatMap((s) => s.ratings);

    const avgSeconds = done ? seconds / done : 0;
    const aiMinutes = avgSeconds / 60 + REVIEW_MINUTES;

    return {
      run,
      totalBriefs: items.length,
      completed: done,
      failed: items.filter((i) => i.status === "failed").length,
      avgGenerationSeconds: round(avgSeconds),
      avgVoiceRating: ratings.length
        ? round(ratings.reduce((a, b) => a + b, 0) / ratings.length, 2)
        : null,
      ratedCount: ratings.length,
      reviewFlagRatePct: posts ? round((flagged / posts) * 100) : null,
      timeSaved: {
        baselineMinutesPerPack: run.baselineMinutes,
        aiMinutesPerPackIncludingReview: round(aiMinutes),
        savedPct: round((1 - aiMinutes / run.baselineMinutes) * 100),
        assumption: `Manual baseline ${run.baselineMinutes} min/pack; AI = generation time + ${REVIEW_MINUTES} min human review.`,
      },
      byIndustry: Array.from(stats.entries()).map(([industry, s]) => ({
        industry,
        briefs: s.briefs,
        completed: s.done,
        avgSeconds: s.done ? round(s.seconds / s.done) : 0,
        avgVoiceRating: s.ratings.length
          ? round(s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length, 2)
          : null,
        reviewFlagRatePct: s.posts ? round((s.flagged / s.posts) * 100) : null,
      })),
    };
  },
});