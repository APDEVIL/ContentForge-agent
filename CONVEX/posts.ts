import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { platformV } from "./lib/validators";
import { computeReviewFlags, normalizeHashtags } from "./lib/guards";

export const insert = internalMutation({
  args: {
    packId: v.id("contentPacks"),
    brandId: v.id("brands"),
    platform: platformV,
    caption: v.string(),
    hashtags: v.array(v.string()),
    imagePrompt: v.string(),
    reviewFlags: v.array(v.string()),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("posts", { ...args, status: "pending_review" }),
});

export const setImage = internalMutation({
  args: {
    postId: v.id("posts"),
    storageId: v.id("_storage"),
    imagePrompt: v.optional(v.string()),
  },
  handler: async (ctx, { postId, storageId, imagePrompt }) => {
    const post = await ctx.db.get(postId);
    if (post?.imageStorageId) await ctx.storage.delete(post.imageStorageId);
    await ctx.db.patch(postId, {
      imageStorageId: storageId,
      imageError: undefined,
      ...(imagePrompt ? { imagePrompt } : {}),
    });
  },
});

export const setImageError = internalMutation({
  args: { postId: v.id("posts"), error: v.string() },
  handler: async (ctx, { postId, error }) => {
    await ctx.db.patch(postId, { imageError: error });
  },
});

/** Editing sends the post back to review and removes it from the calendar. */
export const edit = mutation({
  args: {
    postId: v.id("posts"),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { postId, caption, hashtags }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    const nextCaption = caption ?? post.caption;
    const nextTags = hashtags ? normalizeHashtags(hashtags) : post.hashtags;
    await ctx.db.patch(postId, {
      caption: nextCaption,
      hashtags: nextTags,
      reviewFlags: computeReviewFlags(post.platform, nextCaption, nextTags),
      status: "pending_review",
    });
    const slot = await ctx.db
      .query("calendarSlots")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .unique();
    if (slot) await ctx.db.delete(slot._id);
  },
});

/** HUMAN APPROVAL GATE: nothing can be scheduled until a person approves it. */
export const approve = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.status !== "pending_review")
      throw new Error("Only posts pending review can be approved");
    await ctx.db.patch(postId, { status: "approved" });
  },
});

export const reject = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    await ctx.db.patch(postId, { status: "rejected" });
  },
});

export const getForRegen = internalQuery({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) return null;
    const pack = await ctx.db.get(post.packId);
    if (!pack) return null;
    const brief = await ctx.db.get(pack.briefId);
    const brand = await ctx.db.get(post.brandId);
    if (!brief || !brand) return null;
    const examples = (
      await ctx.db
        .query("brandPosts")
        .withIndex("by_brand", (q) => q.eq("brandId", brand._id))
        .order("desc")
        .take(5)
    ).map((p) => p.text);
    return { post, brand, brief, examples };
  },
});

/** New caption → back to review, and off the calendar. */
export const applyRegen = internalMutation({
  args: {
    postId: v.id("posts"),
    caption: v.string(),
    hashtags: v.array(v.string()),
    reviewFlags: v.array(v.string()),
  },
  handler: async (ctx, { postId, ...rest }) => {
    await ctx.db.patch(postId, { ...rest, status: "pending_review" });
    const slot = await ctx.db
      .query("calendarSlots")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .unique();
    if (slot) await ctx.db.delete(slot._id);
  },
});
