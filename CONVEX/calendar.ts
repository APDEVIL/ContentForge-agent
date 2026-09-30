import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

async function setSlot(
  ctx: MutationCtx,
  post: Doc<"posts">,
  scheduledFor: number,
) {
  const existing = await ctx.db
    .query("calendarSlots")
    .withIndex("by_post", (q) => q.eq("postId", post._id))
    .unique();
  if (existing) await ctx.db.patch(existing._id, { scheduledFor });
  else
    await ctx.db.insert("calendarSlots", {
      postId: post._id,
      brandId: post.brandId,
      scheduledFor,
    });
  await ctx.db.patch(post._id, { status: "scheduled" });
}

export const schedule = mutation({
  args: { postId: v.id("posts"), scheduledFor: v.number() },
  handler: async (ctx, { postId, scheduledFor }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.status !== "approved" && post.status !== "scheduled")
      throw new Error("Approve the post before scheduling it");
    await setSlot(ctx, post, scheduledFor);
  },
});

export const unschedule = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const slot = await ctx.db
      .query("calendarSlots")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .unique();
    if (slot) await ctx.db.delete(slot._id);
    await ctx.db.patch(postId, { status: "approved" });
  },
});

/** One-click calendar: spreads a pack's APPROVED posts across days. */
export const autoSchedulePack = mutation({
  args: {
    packId: v.id("contentPacks"),
    startAt: v.number(), // ms timestamp of the first slot
    intervalHours: v.optional(v.number()), // default 24
  },
  handler: async (ctx, { packId, startAt, intervalHours }) => {
    const step = (intervalHours ?? 24) * 60 * 60 * 1000;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_pack", (q) => q.eq("packId", packId))
      .collect();
    const approved = posts.filter((p) => p.status === "approved");
    for (let i = 0; i < approved.length; i++) {
      await setSlot(ctx, approved[i], startAt + i * step);
    }
    return approved.length;
  },
});

export const listRange = query({
  args: { brandId: v.id("brands"), from: v.number(), to: v.number() },
  handler: async (ctx, { brandId, from, to }) => {
    const slots = await ctx.db
      .query("calendarSlots")
      .withIndex("by_brand_date", (q) =>
        q.eq("brandId", brandId).gte("scheduledFor", from).lte("scheduledFor", to),
      )
      .collect();
    return await Promise.all(
      slots.map(async (slot) => {
        const post = await ctx.db.get(slot.postId);
        return {
          ...slot,
          post: post
            ? {
                ...post,
                imageUrl: post.imageStorageId
                  ? await ctx.storage.getUrl(post.imageStorageId)
                  : null,
              }
            : null,
        };
      }),
    );
  },
});
