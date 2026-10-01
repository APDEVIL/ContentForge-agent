/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_brandVoice from "../ai/brandVoice.js";
import type * as ai_client from "../ai/client.js";
import type * as ai_generatePack from "../ai/generatePack.js";
import type * as ai_imageGen from "../ai/imageGen.js";
import type * as ai_prompts from "../ai/prompts.js";
import type * as ai_regenerate from "../ai/regenerate.js";
import type * as ai_trendSources from "../ai/trendSources.js";
import type * as brandPosts from "../brandPosts.js";
import type * as brands from "../brands.js";
import type * as briefs from "../briefs.js";
import type * as calendar from "../calendar.js";
import type * as contentPacks from "../contentPacks.js";
import type * as evaluation from "../evaluation.js";
import type * as files from "../files.js";
import type * as lib_evalDataset from "../lib/evalDataset.js";
import type * as lib_guards from "../lib/guards.js";
import type * as lib_platforms from "../lib/platforms.js";
import type * as lib_schemas from "../lib/schemas.js";
import type * as lib_validators from "../lib/validators.js";
import type * as posts from "../posts.js";
import type * as trends from "../trends.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/brandVoice": typeof ai_brandVoice;
  "ai/client": typeof ai_client;
  "ai/generatePack": typeof ai_generatePack;
  "ai/imageGen": typeof ai_imageGen;
  "ai/prompts": typeof ai_prompts;
  "ai/regenerate": typeof ai_regenerate;
  "ai/trendSources": typeof ai_trendSources;
  brandPosts: typeof brandPosts;
  brands: typeof brands;
  briefs: typeof briefs;
  calendar: typeof calendar;
  contentPacks: typeof contentPacks;
  evaluation: typeof evaluation;
  files: typeof files;
  "lib/evalDataset": typeof lib_evalDataset;
  "lib/guards": typeof lib_guards;
  "lib/platforms": typeof lib_platforms;
  "lib/schemas": typeof lib_schemas;
  "lib/validators": typeof lib_validators;
  posts: typeof posts;
  trends: typeof trends;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
