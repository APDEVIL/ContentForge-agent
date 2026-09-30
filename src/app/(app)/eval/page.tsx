"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { useState } from "react";
import { EvalRunner } from "~/components/eval/eval-runner";
import { RatingTable } from "~/components/eval/rating-table";
import { ReportCards } from "~/components/eval/report-cards";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

const STATUS_DOT = {
	done: "bg-emerald-500",
	failed: "bg-rose-500",
	running: "animate-pulse bg-sky-500",
} as const;

export default function EvalPage() {
	const runs = useQuery(api.evaluation.listRuns);
	const [picked, setPicked] = useState<Id<"evalRuns"> | null>(null);

	const runId = picked ?? runs?.[0]?._id ?? null;
	const report = useQuery(api.evaluation.report, runId ? { runId } : "skip");
	const running = runs?.some((r) => r.status === "running") ?? false;

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
					Evaluation
				</h1>
				<p className="text-black/60">
					Real numbers for your results slide: time saved, brand-voice match and
					review-flag rate across 30 briefs.
				</p>
			</header>

			<EvalRunner onStarted={setPicked} running={running} />

			{runs === undefined && <Skeleton className="h-48 rounded-[2rem]" />}

			{runs && runs.length === 0 && (
				<p className="rounded-[2rem] border border-black/10 border-dashed bg-white/60 p-10 text-center text-black/50">
					No runs yet. Start one above and the results will appear here.
				</p>
			)}

			{runs && runs.length > 1 && (
				<fieldset className="flex flex-wrap gap-2 border-0 p-0">
					<legend className="mb-2 font-medium text-black/50 text-sm">
						Previous runs
					</legend>
					{runs.map((run) => (
						<label
							className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm transition-all has-[:checked]:border-black has-[:checked]:bg-[#d4ff3f] has-[:focus-visible]:ring-2"
							key={run._id}
						>
							<input
								checked={runId === run._id}
								className="sr-only"
								name="eval-run"
								onChange={() => setPicked(run._id)}
								type="radio"
								value={run._id}
							/>
							<span
								className={cn("size-2 rounded-full", STATUS_DOT[run.status])}
							/>
							{format(new Date(run.startedAt), "d MMM, h:mm a")}
						</label>
					))}
				</fieldset>
			)}

			{runId && report === undefined && (
				<div className="space-y-4">
					<Skeleton className="h-24 rounded-[2rem]" />
					<Skeleton className="h-64 rounded-[2rem]" />
				</div>
			)}

			{runId && report && (
				<>
					<ReportCards report={report} />
					<RatingTable runId={runId} />
				</>
			)}
		</div>
	);
}
