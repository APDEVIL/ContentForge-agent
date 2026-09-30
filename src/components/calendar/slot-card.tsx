"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import {
	CalendarClock,
	Check,
	Copy,
	ExternalLink,
	Loader2,
	Undo2,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PLATFORM_META } from "~/lib/constants";
import { getErrorMessage } from "~/lib/errors";
import { easeOutExpo } from "~/lib/motion";
import { cn } from "~/lib/utils";

export type CalendarSlot = FunctionReturnType<
	typeof api.calendar.listRange
>[number];

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function SlotCard({ slot }: { slot: CalendarSlot }) {
	const schedule = useMutation(api.calendar.schedule);
	const unschedule = useMutation(api.calendar.unschedule);

	const [editing, setEditing] = useState(false);
	const [when, setWhen] = useState(() =>
		format(new Date(slot.scheduledFor), INPUT_FORMAT),
	);
	const [busy, setBusy] = useState<"remove" | "save" | null>(null);

	const post = slot.post;
	if (!post) return null;

	const meta = PLATFORM_META[post.platform];
	const pastDue = slot.scheduledFor < Date.now();

	async function save() {
		if (!post) return;
		const ms = new Date(when).getTime();
		if (!Number.isFinite(ms)) {
			toast.error("Pick a valid date and time");
			return;
		}
		setBusy("save");
		try {
			await schedule({ postId: post._id, scheduledFor: ms });
			toast.success("Rescheduled");
			setEditing(false);
		} catch (e) {
			toast.error("Couldn't reschedule", { description: getErrorMessage(e) });
		} finally {
			setBusy(null);
		}
	}

	async function remove() {
		if (!post) return;
		setBusy("remove");
		try {
			await unschedule({ postId: post._id });
			toast("Removed from the calendar", {
				description: "The post is still approved.",
			});
		} catch (e) {
			toast.error("Couldn't remove", { description: getErrorMessage(e) });
			setBusy(null);
		}
	}

	async function copy() {
		if (!post) return;
		const text = [post.caption, post.hashtags.map((t) => `#${t}`).join(" ")]
			.filter(Boolean)
			.join("\n\n");
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't copy");
		}
	}

	return (
		<motion.article
			animate={{ opacity: 1, y: 0 }}
			className="space-y-3 rounded-[1.75rem] border border-black/5 bg-white/90 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
			exit={{ opacity: 0, scale: 0.95 }}
			initial={{ opacity: 0, y: 16 }}
			layout
			transition={{ duration: 0.4, ease: easeOutExpo }}
		>
			<div className="flex gap-3">
				<div
					className={cn(
						"relative size-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br",
						meta.gradient,
					)}
				>
					{post.imageUrl && (
						<img
							alt={`${meta.label} visual`}
							className="absolute inset-0 size-full object-cover"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
							src={post.imageUrl}
						/>
					)}
				</div>

				<div className="min-w-0 flex-1 space-y-1.5">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-semibold text-sm">{meta.label}</span>
						<span className="text-black/50 text-xs tabular-nums">
							{format(new Date(slot.scheduledFor), "h:mm a")}
						</span>
						{pastDue && (
							<Badge
								className="rounded-full border-amber-200 bg-amber-100 text-amber-800"
								variant="outline"
							>
								Past due
							</Badge>
						)}
					</div>
					<p className="line-clamp-3 whitespace-pre-wrap text-black/70 text-sm">
						{post.caption}
					</p>
				</div>
			</div>

			{post.hashtags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{post.hashtags.slice(0, 6).map((tag) => (
						<span
							className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700 text-xs"
							key={tag}
						>
							#{tag}
						</span>
					))}
				</div>
			)}

			{editing ? (
				<div className="flex flex-wrap items-center gap-2">
					<Input
						aria-label="New date and time"
						className="w-auto rounded-full"
						onChange={(e) => setWhen(e.target.value)}
						type="datetime-local"
						value={when}
					/>
					<Button
						className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
						disabled={busy !== null}
						onClick={() => void save()}
						size="sm"
					>
						{busy === "save" ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Check className="size-4" />
						)}
						Save
					</Button>
					<Button
						className="rounded-full"
						disabled={busy !== null}
						onClick={() => setEditing(false)}
						size="sm"
						variant="ghost"
					>
						Cancel
					</Button>
				</div>
			) : (
				<div className="flex flex-wrap items-center gap-1.5 border-black/5 border-t pt-3">
					<Button
						className="rounded-full"
						disabled={busy !== null}
						onClick={() => setEditing(true)}
						size="sm"
						variant="outline"
					>
						<CalendarClock className="size-4" />
						Reschedule
					</Button>
					<Button
						className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
						disabled={busy !== null}
						onClick={() => void remove()}
						size="sm"
						variant="ghost"
					>
						{busy === "remove" ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Undo2 className="size-4" />
						)}
						Unschedule
					</Button>
					<div className="ml-auto flex items-center gap-1">
						<Button
							aria-label="Copy caption and hashtags"
							className="rounded-full"
							onClick={() => void copy()}
							size="icon"
							title="Copy caption and hashtags"
							variant="ghost"
						>
							<Copy className="size-4" />
						</Button>
						<Button
							aria-label="Open pack"
							className="rounded-full"
							nativeButton={false}
							render={<Link href={`/packs/${post.packId}`} />}
							size="icon"
							title="Open pack"
							variant="ghost"
						>
							<ExternalLink className="size-4" />
						</Button>
					</div>
				</div>
			)}
		</motion.article>
	);
}
