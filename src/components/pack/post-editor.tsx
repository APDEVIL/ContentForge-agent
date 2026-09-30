"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { PLATFORM_META, type Platform } from "~/lib/constants";
import { cn } from "~/lib/utils";

type Props = {
	postId: Id<"posts">;
	platform: Platform;
	caption: string;
	hashtags: string[];
	status: "pending_review" | "approved" | "rejected" | "scheduled";
	onClose: () => void;
};

function parseTags(input: string): string[] {
	return input
		.split(/[\s,]+/)
		.map((t) => t.replace(/^#+/, "").trim())
		.filter(Boolean);
}

export function PostEditor({
	postId,
	platform,
	caption,
	hashtags,
	status,
	onClose,
}: Props) {
	const edit = useMutation(api.posts.edit);
	const meta = PLATFORM_META[platform];

	const [text, setText] = useState(caption);
	const [tags, setTags] = useState(hashtags.map((h) => `#${h}`).join(" "));
	const [saving, setSaving] = useState(false);

	const tagList = parseTags(tags);
	const total = [text.trim(), tagList.map((t) => `#${t}`).join(" ")]
		.join(" ")
		.trim().length;
	const overLength = total > meta.maxChars;
	const tooManyTags = tagList.length > meta.maxHashtags;

	const unchanged =
		text === caption &&
		tagList.join(",").toLowerCase() === hashtags.join(",").toLowerCase();
	const canSave = !saving && text.trim().length > 0 && !unchanged;
	const willReopen = status === "approved" || status === "scheduled";

	async function save() {
		if (!canSave) return;
		setSaving(true);
		try {
			await edit({ postId, caption: text.trim(), hashtags: tagList });
			toast.success("Changes saved", {
				description: "This post is back in review.",
			});
			onClose();
		} catch (e) {
			toast.error("Couldn't save changes", {
				description: e instanceof Error ? e.message.slice(0, 160) : undefined,
			});
			setSaving(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor={`caption-${postId}`}>Caption</Label>
					<span
						className={cn(
							"text-xs tabular-nums",
							overLength ? "font-semibold text-rose-600" : "text-black/40",
						)}
					>
						{total}/{meta.maxChars}
					</span>
				</div>
				<Textarea
					autoFocus
					className="rounded-2xl"
					id={`caption-${postId}`}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void save();
					}}
					rows={platform === "x" ? 4 : 9}
					value={text}
				/>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor={`tags-${postId}`}>Hashtags</Label>
					<span
						className={cn(
							"text-xs tabular-nums",
							tooManyTags ? "font-semibold text-rose-600" : "text-black/40",
						)}
					>
						{tagList.length}/{meta.maxHashtags}
					</span>
				</div>
				<Input
					className="rounded-full"
					id={`tags-${postId}`}
					onChange={(e) => setTags(e.target.value)}
					placeholder="#brand #launch #newdrop"
					value={tags}
				/>
			</div>

			{willReopen && (
				<p className="rounded-2xl bg-amber-50 px-4 py-2.5 text-amber-800 text-xs">
					Saving sends this post back to review
					{status === "scheduled" ? " and removes it from the calendar" : ""}.
				</p>
			)}

			<div className="flex justify-end gap-2">
				<Button
					className="rounded-full"
					disabled={saving}
					onClick={onClose}
					variant="ghost"
				>
					Cancel
				</Button>
				<Button
					className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
					disabled={!canSave}
					onClick={() => void save()}
				>
					{saving ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Save className="size-4" />
					)}
					Save changes
				</Button>
			</div>
		</div>
	);
}
