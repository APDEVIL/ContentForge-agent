"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { CalendarPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { PLATFORM_META } from "~/lib/constants";
import { getErrorMessage } from "~/lib/errors";

type Props = {
	brandId: Id<"brands">;
	onOpenChange: (open: boolean) => void;
	onScheduled: (startAt: number) => void;
	open: boolean;
};

const INTERVALS = [
	{ hours: 12, label: "Every 12 hours" },
	{ hours: 24, label: "Daily" },
	{ hours: 48, label: "Every 2 days" },
] as const;

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

function defaultStart() {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	d.setHours(10, 0, 0, 0);
	return format(d, INPUT_FORMAT);
}

const SKELETON = ["k1", "k2", "k3"];

export function AutoScheduleDialog({
	brandId,
	onOpenChange,
	onScheduled,
	open,
}: Props) {
	const packs = useQuery(
		api.contentPacks.listByBrand,
		open ? { brandId } : "skip",
	);
	const autoSchedule = useMutation(api.calendar.autoSchedulePack);

	const [chosen, setChosen] = useState<Id<"contentPacks"> | null>(null);
	const [start, setStart] = useState(defaultStart);
	const [interval, setIntervalHours] = useState<number>(24);
	const [saving, setSaving] = useState(false);

	const readyPacks = packs?.filter((p) => p.status === "ready") ?? [];
	const activeId = chosen ?? readyPacks[0]?._id ?? null;

	const detail = useQuery(
		api.contentPacks.get,
		activeId ? { packId: activeId } : "skip",
	);
	const approved = detail?.posts.filter((p) => p.status === "approved") ?? [];

	const startAt = new Date(start).getTime();
	const validStart = Number.isFinite(startAt);
	const canSubmit = !saving && !!activeId && approved.length > 0 && validStart;

	async function submit() {
		if (!canSubmit || !activeId) return;
		setSaving(true);
		try {
			const n = await autoSchedule({
				intervalHours: interval,
				packId: activeId,
				startAt,
			});
			toast.success(`${n} post${n === 1 ? "" : "s"} scheduled`);
			onScheduled(startAt);
			onOpenChange(false);
		} catch (e) {
			toast.error("Couldn't schedule", { description: getErrorMessage(e) });
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Auto-schedule a pack</DialogTitle>
					<DialogDescription>
						Approved posts are spread across the calendar, one after another.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					<fieldset className="space-y-2 border-0 p-0">
						<legend className="mb-2 font-medium text-sm">Pack</legend>
						{packs === undefined && (
							<div className="space-y-2">
								{SKELETON.map((id) => (
									<Skeleton className="h-14 rounded-2xl" key={id} />
								))}
							</div>
						)}
						{packs && readyPacks.length === 0 && (
							<p className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800 text-sm">
								No finished packs yet.{" "}
								<Link className="font-semibold underline" href="/brief/new">
									Create a brief
								</Link>
							</p>
						)}
						{readyPacks.map((pack) => (
							<label
								className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 transition-all has-[:checked]:border-black has-[:checked]:bg-[#d4ff3f] has-[:focus-visible]:ring-2"
								key={pack._id}
							>
								<input
									checked={activeId === pack._id}
									className="sr-only"
									name="pack"
									onChange={() => setChosen(pack._id)}
									type="radio"
									value={pack._id}
								/>
								<span className="line-clamp-1 font-medium text-sm">
									{pack.topic || "Untitled brief"}
								</span>
								<span className="shrink-0 text-black/50 text-xs">
									{format(new Date(pack._creationTime), "d MMM")}
								</span>
							</label>
						))}
					</fieldset>

					<div className="space-y-2">
						<Label htmlFor="auto-start">First post goes out</Label>
						<Input
							className="rounded-full"
							id="auto-start"
							onChange={(e) => setStart(e.target.value)}
							type="datetime-local"
							value={start}
						/>
					</div>

					<fieldset className="space-y-2 border-0 p-0">
						<legend className="mb-2 font-medium text-sm">Spacing</legend>
						<div className="flex flex-wrap gap-2">
							{INTERVALS.map((opt) => (
								<label
									className="cursor-pointer rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm transition-all has-[:checked]:border-black has-[:checked]:bg-[#d4ff3f] has-[:focus-visible]:ring-2"
									key={opt.hours}
								>
									<input
										checked={interval === opt.hours}
										className="sr-only"
										name="interval"
										onChange={() => setIntervalHours(opt.hours)}
										type="radio"
										value={opt.hours}
									/>
									{opt.label}
								</label>
							))}
						</div>
					</fieldset>

					{activeId && detail === undefined && (
						<Skeleton className="h-20 rounded-2xl" />
					)}

					{detail && approved.length === 0 && (
						<p className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800 text-sm">
							This pack has no approved posts yet.{" "}
							<Link
								className="font-semibold underline"
								href={`/packs/${activeId}`}
							>
								Review and approve them
							</Link>
						</p>
					)}

					{approved.length > 0 && validStart && (
						<div className="space-y-2">
							<p className="font-medium text-sm">Preview</p>
							<ul className="space-y-1.5">
								{approved.map((post, i) => (
									<li
										className="flex items-center justify-between rounded-xl bg-black/[0.03] px-3 py-2 text-sm"
										key={post._id}
									>
										<span className="font-medium">
											{PLATFORM_META[post.platform].label}
										</span>
										<span className="text-black/50 tabular-nums">
											{format(
												new Date(startAt + i * interval * 3_600_000),
												"EEE d MMM, h:mm a",
											)}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						className="rounded-full"
						onClick={() => onOpenChange(false)}
						variant="ghost"
					>
						Cancel
					</Button>
					<Button
						className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
						disabled={!canSubmit}
						onClick={() => void submit()}
					>
						{saving ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<CalendarPlus className="size-4" />
						)}
						Schedule {approved.length || ""} post
						{approved.length === 1 ? "" : "s"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
