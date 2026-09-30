"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAction } from "convex/react";
import { FlaskConical, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getErrorMessage } from "~/lib/errors";

type Props = {
	onStarted: (runId: Id<"evalRuns">) => void;
	running: boolean;
};

const WHAT_HAPPENS = [
	"Creates 3 sample brands: fashion, B2B SaaS and food & beverage.",
	"Learns each brand's voice from 4 sample posts.",
	"Generates a full pack (Instagram, LinkedIn, X) for 30 briefs, one at a time.",
	"Tracks generation time and how many posts get review flags.",
];

export function EvalRunner({ onStarted, running }: Props) {
	const start = useAction(api.evaluation.start);
	const [baseline, setBaseline] = useState("45");
	const [starting, setStarting] = useState(false);

	const minutes = Number(baseline);
	const validBaseline =
		Number.isFinite(minutes) && minutes >= 5 && minutes <= 480;
	const canStart = !starting && !running && validBaseline;

	async function begin() {
		if (!canStart) return;
		setStarting(true);
		try {
			const runId = await start({ baselineMinutes: minutes });
			toast.success("Evaluation started", {
				description: "Packs are being generated one by one.",
			});
			onStarted(runId);
		} catch (e) {
			toast.error("Couldn't start the evaluation", {
				description: getErrorMessage(e),
			});
		} finally {
			setStarting(false);
		}
	}

	return (
		<section className="space-y-5 rounded-[2rem] border border-black/5 bg-gradient-to-br from-lime-50 via-white to-cyan-50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
			<div className="flex items-center gap-2">
				<span className="flex size-8 items-center justify-center rounded-full bg-[#d4ff3f]">
					<FlaskConical className="size-4 text-black" />
				</span>
				<div>
					<h2 className="font-semibold text-lg">Run the evaluation</h2>
					<p className="text-black/50 text-sm">
						Takes about 10 to 15 minutes. You can leave this page open or come
						back later.
					</p>
				</div>
			</div>

			<ol className="space-y-2 text-black/70 text-sm">
				{WHAT_HAPPENS.map((line, i) => (
					<li className="flex gap-3" key={line}>
						<span className="font-semibold text-black/30 tabular-nums">
							{String(i + 1).padStart(2, "0")}
						</span>
						{line}
					</li>
				))}
			</ol>

			<div className="flex flex-wrap items-end gap-4">
				<div className="space-y-2">
					<Label htmlFor="eval-baseline">Manual time per pack (minutes)</Label>
					<Input
						className="w-40 rounded-full"
						id="eval-baseline"
						inputMode="numeric"
						onChange={(e) => setBaseline(e.target.value)}
						value={baseline}
					/>
				</div>
				<Button
					className="h-10 rounded-full bg-[#d4ff3f] px-6 font-semibold text-black hover:bg-[#c8f22d]"
					disabled={!canStart}
					onClick={() => void begin()}
				>
					{starting ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<FlaskConical className="size-4" />
					)}
					{starting
						? "Preparing brands…"
						: running
							? "A run is in progress"
							: "Start evaluation"}
				</Button>
			</div>

			{!validBaseline && (
				<p className="text-rose-600 text-xs">
					Enter a number between 5 and 480.
				</p>
			)}

			<p className="rounded-2xl bg-white/70 px-4 py-3 text-black/50 text-xs">
				This adds 3 sample brands to your workspace. To save Hugging Face
				credits, run{" "}
				<code className="rounded bg-black/5 px-1.5 py-0.5">
					bunx convex env set SKIP_IMAGES true
				</code>{" "}
				first (needs the optional line in <code>imageGen.ts</code>) and remove
				it afterwards.
			</p>
		</section>
	);
}
