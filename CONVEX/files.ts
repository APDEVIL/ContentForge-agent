import { mutation } from "./_generated/server";

/** Step 1 of a file upload (logo / brand assets): get a short-lived upload URL. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});
