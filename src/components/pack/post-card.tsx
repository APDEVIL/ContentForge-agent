"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Check, Copy, Loader2, Pencil, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { PLATFORM_META, STATUS_META } from "~/lib/constants";
import { easeOutExpo } from "~/lib/motion";
import { cn } from "~/lib/utils";
import { ImageFrame } from "./image-frame";
import { PostEditor } from "./post-editor";
import { type RegenBusy, RegenerateMenu } from "./regenerate-menu";
import { ReviewFlags } from "./review-flags";

export type PackData = NonNullable<
	FunctionReturnType<typeof api.contentPacks.get>
>;
export type PackPost = PackData["posts"][number];

type Props = {
	post: PackPost;
	/** pass pack.status === "generating" */
	generating?: boolean;
};

type Acting = "approve" | "reject" | "reopen" | null;

function errorMessage(e: unknown) {
	if (e instanceof Error) {
		const m = /Uncaught Error:\s*(.+?)(?:\n|$)/.exec(e.message);
		return (m?.[1] ?? e.message).slice(0, 160);
	}
	return undefined;
}

function PlatformIcon({ src }: { src: string }) {
	const [hidden, setHidden] = useState(false);
	if (hidden) return null;
	return (
		<img
			alt=""
			aria-hidden
			className="size-5 object-contain"
			onError={() => setHidden(true)}
			src={src}
		/>
	);
}

export function PostCard({ post, generating = false }: Props) {
	const meta = PLATFORM_META[post.platform];
	const status = STATUS_META[post.status];

	const approve = useMutation(api.posts.approve);
	const reject = useMutation(api.posts.reject);
	const edit = useMutation(api.posts.edit);

	const [editing, setEditing] = useState(false);
	const [busy, setBusy] = useState<RegenBusy>(null);
	const [acting, setActing] = useState<Acting>(null);

	const disabled = generating || acting !== null || busy !== null;

	const total = [
		post.caption.trim(),
		post.hashtags.map((t) => `#${t}`).join(" "),
	]
		.join(" ")
		.trim().length;
	const overLength = total > meta.maxChars;

	async function run(kind: Exclude<Acting, null>, fn: () => Promise<unknown>) {
		setActing(kind);
		try {
			await fn();
		} catch (e) {
			toast.error("Something went wrong", { description: errorMessage(e) });
		} finally {
			setActing(null);
		}
	}

	const handleApprove = () =>
		run("approve", async () => {
			await approve({ postId: post._id });
			toast.success(`${meta.label} post approved`);
		});

	const handleReject = () =>
		run("reject", async () => {
			await reject({ postId: post._id });
			toast(`${meta.label} post rejected`);
		});

	// edit() with no changes just moves the post back to pending_review
	const handleReopen = () =>
		run("reopen", async () => {
			await edit({ postId: post._id });
			toast(`${meta.label} post moved back to review`);
		});

	async function handleCopy() {
		const text = [
			post.caption,
			post.hashtags.length ? post.hashtags.map((t) => `#${t}`).join(" ") : "",
		]
			.filter(Boolean)
			.join("\n\n");
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't copy. Select the text manually.");
		}
	}

	return (
		<motion.article
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur"
			initial={{ opacity: 0, y: 24 }}
			transition={{ duration: 0.6, ease: easeOutExpo }}
			whileHover={{ y: -3 }}
		>
			{/* header */}
			<header className="flex items-center justify-between px-5 pt-5 pb-3">
				<div className="flex items-center gap-2">
					<PlatformIcon src={meta.icon} />
					<h3 className="font-semibold text-base">{meta.label}</h3>
				</div>
				<Badge
					className={cn("rounded-full", status.className)}
					variant="outline"
				>
					{status.label}
				</Badge>
			</header>

			{/* visual */}
			<div className="px-4">
				<ImageFrame
					alt={`${meta.label} visual`}
					error={post.imageError}
					loading={generating && !post.imageUrl && !post.imageError}
					platform={post.platform}
					regenerating={busy === "image"}
					src={post.imageUrl}
				/>
			</div>

			{/* body */}
			<div className="flex-1 space-y-4 px-5 py-5">
				<AnimatePresence initial={false} mode="wait">
					{editing ? (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							initial={{ opacity: 0, y: 8 }}
							key="editor"
							transition={{ duration: 0.25 }}
						>
							<PostEditor
								caption={post.caption}
								hashtags={post.hashtags}
								onClose={() => setEditing(false)}
								platform={post.platform}
								postId={post._id}
								status={post.status}
							/>
						</motion.div>
					) : (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="space-y-4"
							exit={{ opacity: 0, y: -8 }}
							initial={{ opacity: 0, y: 8 }}
							key="view"
							transition={{ duration: 0.25 }}
						>
							<div
								className={cn(
									"space-y-3 transition-opacity",
									busy === "caption" && "animate-pulse opacity-40",
								)}
							>
								<p className="whitespace-pre-wrap text-[15px] text-black/80 leading-relaxed">
									{post.caption}
								</p>
								{post.hashtags.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{post.hashtags.map((tag) => (
											<span
												className="rounded-full bg-sky-50 px-2.5 py-0.5 font-medium text-sky-700 text-xs"
												key={tag}
											>
												#{tag}
											</span>
										))}
									</div>
								)}
								<p
									className={cn(
										"text-xs tabular-nums",
										overLength
											? "font-semibold text-rose-600"
											: "text-black/40",
									)}
								>
									{total}/{meta.maxChars} characters
								</p>
							</div>

							<ReviewFlags flags={post.reviewFlags} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* actions */}
			{!editing && (
				<footer className="flex flex-wrap items-center gap-2 border-black/5 border-t px-5 py-4">
					{post.status === "pending_review" && (
						<>
							<Button
								className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
								disabled={disabled}
								onClick={handleApprove}
							>
								{acting === "approve" ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Check className="size-4" />
								)}
								Approve
							</Button>
							<Button
								className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
								disabled={disabled}
								onClick={handleReject}
								variant="ghost"
							>
								{acting === "reject" ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<X className="size-4" />
								)}
								Reject
							</Button>
						</>
					)}

					{post.status === "rejected" && (
						<Button
							className="rounded-full"
							disabled={disabled}
							onClick={handleReopen}
							variant="outline"
						>
							{acting === "reopen" ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<RotateCcw className="size-4" />
							)}
							Move back to review
						</Button>
					)}

					{post.status === "approved" && (
						<span className="font-medium text-emerald-700 text-sm">
							Approved. Ready for the calendar.
						</span>
					)}
					{post.status === "scheduled" && (
						<span className="font-medium text-sky-700 text-sm">
							On the calendar
						</span>
					)}

					<div className="ml-auto flex items-center gap-1.5">
						<Button
							aria-label="Edit post"
							className="rounded-full"
							disabled={disabled}
							onClick={() => setEditing(true)}
							size="icon"
							title="Edit"
							variant="ghost"
						>
							<Pencil className="size-4" />
						</Button>
						<Button
							aria-label="Copy caption and hashtags"
							className="rounded-full"
							onClick={() => void handleCopy()}
							size="icon"
							title="Copy caption and hashtags"
							variant="ghost"
						>
							<Copy className="size-4" />
						</Button>
						<RegenerateMenu
							disabled={generating || acting !== null}
							onBusyChange={setBusy}
							postId={post._id}
						/>
					</div>
				</footer>
			)}
		</motion.article>
	);
}
