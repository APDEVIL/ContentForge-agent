/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
 * useful for Docker builds.
 */
import "./src/env.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
	webpack: (webpackConfig) => {
		// Same as the "@convex/*" path in tsconfig, but explicit for production builds
		webpackConfig.resolve.alias = {
			...webpackConfig.resolve.alias,
			"@convex": path.join(root, "convex"),
		};
		return webpackConfig;
	},
};

export default config;