export const BRAND = {
	name: "ContentForge",
	tagline: "One idea in. A week of on-brand content out.",
};

/* ---------- images (see the public/ folder) ---------- */

export const IMAGES = {
	logo: "/brand/logo.svg",
	logoMark: "/brand/logo-mark.svg",
	og: "/og.png",
	characters: [
		"/characters/creator-1.webp",
		"/characters/creator-2.webp",
		"/characters/creator-3.webp",
		"/characters/creator-4.webp",
		"/characters/creator-5.webp",
	],
	steps: {
		voice: "/steps/step-1-voice.webp",
		trends: "/steps/step-2-trends.webp",
		create: "/steps/step-3-create.webp",
		approve: "/steps/step-4-approve.webp",
	},
	cta: "/cta/cta-character.webp",
	empty: {
		brands: "/empty/empty-brands.webp",
		packs: "/empty/empty-packs.webp",
		calendar: "/empty/empty-calendar.webp",
	},
	generating: "/loading/generating.webp",
} as const;

/* ---------- colours used by GSAP / canvas effects ---------- */

export const WAVE_COLORS = [
	"#d4ff3f", // lime
	"#22d3ee", // cyan
	"#60a5fa", // blue
	"#a78bfa", // violet
	"#f0abfc", // pink
	"#fde68a", // yellow
] as const;

/* ---------- platforms (must match convex/lib/platforms.ts) ---------- */

export type Platform = "instagram" | "linkedin" | "x";

export const PLATFORMS: Platform[] = ["instagram", "linkedin", "x"];

export const PLATFORM_META: Record<
	Platform,
	{
		label: string;
		maxChars: number;
		maxHashtags: number;
		aspect: string; // tailwind class for the image frame
		icon: string;
		gradient: string; // tailwind gradient classes
	}
> = {
	instagram: {
		label: "Instagram",
		maxChars: 2200,
		maxHashtags: 15,
		aspect: "aspect-square",
		icon: "/platforms/instagram.svg",
		gradient: "from-fuchsia-300 via-orange-200 to-yellow-200",
	},
	linkedin: {
		label: "LinkedIn",
		maxChars: 3000,
		maxHashtags: 5,
		aspect: "aspect-[19/10]",
		icon: "/platforms/linkedin.svg",
		gradient: "from-sky-300 via-blue-200 to-cyan-100",
	},
	x: {
		label: "X",
		maxChars: 280,
		maxHashtags: 2,
		aspect: "aspect-video",
		icon: "/platforms/x.svg",
		gradient: "from-zinc-300 via-slate-200 to-stone-100",
	},
};

/* ---------- generation progress (strings must match generatePack.ts) ---------- */

export const PACK_STAGES = [
	"Queued",
	"Finding trends & hashtags",
	"Writing captions",
	"Creating visuals",
	"Ready for review",
] as const;

/* ---------- post status ---------- */

export type PostStatus =
	| "pending_review"
	| "approved"
	| "rejected"
	| "scheduled";

export const STATUS_META: Record<
	PostStatus,
	{ label: string; className: string }
> = {
	pending_review: {
		label: "Needs review",
		className: "bg-amber-100 text-amber-800 border-amber-200",
	},
	approved: {
		label: "Approved",
		className: "bg-emerald-100 text-emerald-800 border-emerald-200",
	},
	rejected: {
		label: "Rejected",
		className: "bg-rose-100 text-rose-800 border-rose-200",
	},
	scheduled: {
		label: "Scheduled",
		className: "bg-sky-100 text-sky-800 border-sky-200",
	},
};

/* ---------- review flags (keys come from convex/lib/guards.ts) ---------- */

export const REVIEW_FLAG_LABELS: Record<string, string> = {
	empty_caption: "Caption is empty",
	over_length: "Over the platform's character limit",
	too_many_hashtags: "Too many hashtags",
	no_hashtags: "No hashtags",
	placeholder_or_ai_leak: "Contains a placeholder or AI wording",
};

/* ---------- navigation ---------- */

export const LANDING_NAV = [
	{ label: "Product", href: "#product" },
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Platforms", href: "#platforms" },
] as const;

export const APP_NAV = [
	{ label: "Brands", href: "/brands" },
	{ label: "New brief", href: "/brief/new" },
	{ label: "Calendar", href: "/calendar" },
	{ label: "Eval", href: "/eval" },
] as const;

/* ---------- landing content ---------- */

export const HERO_FEATURES = [
	"Fast drafts",
	"Sounds like you",
	"You approve everything",
] as const;

export const CAROUSEL_CARDS = [
	{ label: "Creators", src: IMAGES.characters[0] },
	{ label: "Founders", src: IMAGES.characters[1] },
	{ label: "Marketers", src: IMAGES.characters[2] },
	{ label: "Agencies", src: IMAGES.characters[3] },
	{ label: "Freelancers", src: IMAGES.characters[4] },
] as const;

export const STEPS = [
	{
		number: "01",
		title: "Learning your voice",
		body: "Paste a few past posts and ContentForge picks up your tone, words and habits.",
		image: IMAGES.steps.voice,
	},
	{
		number: "02",
		title: "Finding what's trending",
		body: "Fresh topics and hashtags for your industry, pulled in before every draft.",
		image: IMAGES.steps.trends,
	},
	{
		number: "03",
		title: "Creating posts and visuals",
		body: "Captions and images for Instagram, LinkedIn and X from one brief.",
		image: IMAGES.steps.create,
	},
	{
		number: "04",
		title: "You approve, we schedule",
		body: "Nothing is ready to post until you approve it. Then it lands on your calendar.",
		image: IMAGES.steps.approve,
	},
] as const;
