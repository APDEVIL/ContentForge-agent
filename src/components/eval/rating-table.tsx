"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

const STATUS_STYLE = {
	queued: "bg-zinc-100 text-zinc-600 border-zinc-200",
	running: "bg-sky-100 text-sky-800 border-sky-200 animate-pulse",
	done: "bg-emerald-100 text-emerald-800 border-emerald-200",
	failed: "bg-rose-100 text-rose-800 border-rose-200",
} as const;

const STATUS_LABEL = {
	queued: "Queued",
	running: "Generating",
	done: "Done",
	failed: "Failed",
} as const;

const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5", "r6"];
const RATINGS = [1, 2, 3, 4, 5] as const;

export function RatingTable({ runId }: { runId: Id<"evalRuns"> }) {
	const items = useQuery(api.evaluation.items, { runId });
	const rate = useMutation(api.evaluation.rate);

	const [tab, setTab] = useState("all");
	const [pending, setPending] = useState<string | null>(null);

	const sorted = useMemo(
		() =>
			items ? [...items].sort((a, b) => a._creationTime - b._creationTime) : [],
		[items],
	);
	const industries = useMemo(
		() => Array.from(new Set(sorted.map((i) => i.industry))),
		[sorted],
	);
	const visible =
		tab === "all" ? sorted : sorted.filter((i) => i.industry === tab);

	const doneCount = sorted.filter((i) => i.status === "done").length;
	const ratedCount = sorted.filter((i) => i.voiceRating !== undefined).length;

	async function setRating(itemId: Id<"evalItems">, rating: number) {
		setPending(itemId);
		try {
			await rate({ itemId, rating });
		} catch {
			toast.error("Couldn't save the rating");
		} finally {
			setPending(null);
		}
	}

	if (items === undefined) {
		return (
			<div className="space-y-3">
				{SKELETON_ROWS.map((id) => (
					<Skeleton className="h-16 w-full rounded-2xl" key={id} />
				))}
			</div>
		);
	}

	return (
		<section className="space-y-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 className="font-semibold text-lg">Rate brand-voice match</h3>
					<p className="text-black/50 text-sm">
						Open each pack and score it: 1 = off-brand, 5 = sounds exactly like
						the brand.{" "}
						<span className="font-medium text-black/70">
							{ratedCount} of {doneCount} rated
						</span>
					</p>
				</div>

				<Tabs onValueChange={(v) => setTab(String(v))} value={tab}>
					<TabsList className="h-auto flex-wrap rounded-full">
						<TabsTrigger className="rounded-full" value="all">
							All
						</TabsTrigger>
						{industries.map((ind) => (
							<TabsTrigger className="rounded-full" key={ind} value={ind}>
								{ind}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</div>

			<ul className="space-y-2.5">
				{visible.map((item) => {
					const canRate = item.status === "done";
					const disabled = !canRate || pending === item._id;

					return (
						<li
							className="grid items-center gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm md:grid-cols-[1fr_auto_auto_auto]"
							key={item._id}
						>
							<div className="min-w-0">
								<p className="truncate font-medium text-sm">{item.topic}</p>
								<p className="text-black/40 text-xs">{item.industry}</p>
							</div>

							<div className="flex items-center gap-3">
								<Badge
									className={cn("rounded-full", STATUS_STYLE[item.status])}
									variant="outline"
								>
									{STATUS_LABEL[item.status]}
								</Badge>
								{item.seconds !== undefined && (
									<span className="text-black/40 text-xs tabular-nums">
										{item.seconds.toFixed(1)}s
									</span>
								)}
							</div>

							<div>
								{item.packId && canRate ? (
									<Link
										className="inline-flex items-center gap-1 font-medium text-sky-700 text-sm hover:underline"
										href={`/packs/${item.packId}`}
										target="_blank"
									>
										View pack
										<ExternalLink className="size-3.5" />
									</Link>
								) : (
									<span className="text-black/25 text-sm">—</span>
								)}
							</div>

							<fieldset className="flex items-center gap-1.5 border-0 p-0">
								<legend className="sr-only">
									Brand voice rating for {item.topic}
								</legend>
								{RATINGS.map((n) => {
									const selected = item.voiceRating === n;
									return (
										<label
											className={cn(
												"relative flex size-8 cursor-pointer items-center justify-center rounded-full font-semibold text-sm transition-all",
												"has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-30",
												"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/40",
												selected
													? "scale-110 bg-[#d4ff3f] text-black shadow-md"
													: "bg-black/5 text-black/60 hover:scale-105 hover:bg-lime-100",
											)}
											key={n}
										>
											<input
												checked={selected}
												className="sr-only"
												disabled={disabled}
												name={`rating-${item._id}`}
												onChange={() => void setRating(item._id, n)}
												type="radio"
												value={n}
											/>
											{n}
										</label>
									);
								})}
							</fieldset>
						</li>
					);
				})}
			</ul>

			{visible.length === 0 && (
				<p className="py-8 text-center text-black/40 text-sm">
					Nothing to show yet.
				</p>
			)}
		</section>
	);
}
