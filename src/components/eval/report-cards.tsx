"use client";

import type { api } from "convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Copy,
	Star,
	Timer,
} from "lucide-react";
import { animate, motion, useInView } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { fadeUp, revealProps, staggerContainer } from "~/lib/motion";
import { cn } from "~/lib/utils";

export type EvalReport = NonNullable<
	FunctionReturnType<typeof api.evaluation.report>
>;

/* ---------- small helpers ---------- */

function CountUp({
	value,
	decimals = 0,
}: {
	value: number;
	decimals?: number;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true });
	const reduced = useReducedMotion();

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (reduced) {
			el.textContent = value.toFixed(decimals);
			return;
		}
		if (!inView) return;
		const controls = animate(0, value, {
			duration: 1.2,
			ease: "easeOut",
			onUpdate: (v) => {
				el.textContent = v.toFixed(decimals);
			},
		});
		return () => controls.stop();
	}, [inView, value, decimals, reduced]);

	return <span ref={ref}>{(0).toFixed(decimals)}</span>;
}

function StatCard({
	icon,
	label,
	children,
	hint,
	tint,
}: {
	icon: ReactNode;
	label: string;
	children: ReactNode;
	hint: string;
	tint: string;
}) {
	return (
		<motion.div
			className={cn(
				"rounded-[2rem] border border-black/5 bg-gradient-to-br p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]",
				tint,
			)}
			variants={fadeUp}
			whileHover={{ y: -4 }}
		>
			<div className="mb-4 flex items-center gap-2 font-medium text-black/60 text-sm">
				<span className="flex size-8 items-center justify-center rounded-full bg-white/80">
					{icon}
				</span>
				{label}
			</div>
			<div className="font-semibold text-5xl text-black tracking-tight">
				{children}
			</div>
			<p className="mt-2 text-black/50 text-sm">{hint}</p>
		</motion.div>
	);
}

function Dash() {
	return <span className="text-black/25">—</span>;
}

function CompareBar({
	label,
	minutes,
	pct,
	barClass,
}: {
	label: string;
	minutes: number;
	pct: number;
	barClass: string;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex justify-between text-sm">
				<span className="font-medium text-black/70">{label}</span>
				<span className="text-black/50 tabular-nums">{minutes} min</span>
			</div>
			<div className="h-4 overflow-hidden rounded-full bg-black/5">
				<motion.div
					className={cn("h-full rounded-full", barClass)}
					initial={{ width: 0 }}
					transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					whileInView={{ width: `${Math.max(pct, 2)}%` }}
				/>
			</div>
		</div>
	);
}

/* ---------- main component ---------- */

export function ReportCards({ report: r }: { report: EvalReport }) {
	const finished = r.completed + r.failed;
	const progressPct = r.totalBriefs ? (finished / r.totalBriefs) * 100 : 0;
	const t = r.timeSaved;
	const aiPct = Math.min(
		100,
		(t.aiMinutesPerPackIncludingReview / t.baselineMinutesPerPack) * 100,
	);

	async function copySummary() {
		const lines = [
			`ContentForge evaluation: ${r.completed}/${r.totalBriefs} briefs across ${r.byIndustry.length} industries`,
			`Time saved: ${t.savedPct}% (${t.baselineMinutesPerPack} min → ${t.aiMinutesPerPackIncludingReview} min per pack)`,
			`Brand-voice rating: ${r.avgVoiceRating ?? "n/a"} / 5 (${r.ratedCount} packs rated)`,
			`Review-flag rate: ${r.reviewFlagRatePct ?? "n/a"}%`,
			`Average generation time: ${r.avgGenerationSeconds}s per pack`,
			`Assumption: ${t.assumption}`,
		];
		try {
			await navigator.clipboard.writeText(lines.join("\n"));
			toast.success("Summary copied. Paste it into your slide.");
		} catch {
			toast.error("Couldn't copy");
		}
	}

	return (
		<div className="space-y-8">
			{/* header */}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="font-semibold text-2xl tracking-tight">
						{r.run.name}
					</h2>
					<p className="mt-1 flex items-center gap-2 text-black/50 text-sm">
						<Clock className="size-3.5" />
						Started {format(new Date(r.run.startedAt), "d MMM yyyy, h:mm a")}
						<span
							className={cn(
								"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs",
								r.run.status === "running" && "bg-sky-100 text-sky-800",
								r.run.status === "done" && "bg-emerald-100 text-emerald-800",
								r.run.status === "failed" && "bg-rose-100 text-rose-800",
							)}
						>
							{r.run.status === "running" && (
								<span className="size-1.5 animate-pulse rounded-full bg-sky-500" />
							)}
							{r.run.status === "running"
								? "Running"
								: r.run.status === "done"
									? "Finished"
									: "Failed"}
						</span>
					</p>
				</div>
				<Button
					className="rounded-full"
					onClick={() => void copySummary()}
					variant="outline"
				>
					<Copy className="size-4" />
					Copy for slide
				</Button>
			</div>

			{/* progress */}
			<div className="space-y-2 rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
				<div className="flex items-center justify-between text-sm">
					<span className="font-medium text-black/70">
						{finished} of {r.totalBriefs} briefs processed
					</span>
					{r.failed > 0 && (
						<span className="text-rose-600">{r.failed} failed</span>
					)}
				</div>
				<Progress className="h-2.5" value={progressPct} />
			</div>

			{/* headline numbers */}
			<motion.div
				variants={staggerContainer(0.08)}
				{...revealProps}
				className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
			>
				<StatCard
					hint={`${t.baselineMinutesPerPack} min → ${t.aiMinutesPerPackIncludingReview} min per pack`}
					icon={<Timer className="size-4" />}
					label="Time saved"
					tint="from-lime-100 via-white to-yellow-50"
				>
					<CountUp value={t.savedPct} />%
				</StatCard>

				<StatCard
					hint={
						r.avgVoiceRating === null
							? "Rate the packs below to see this"
							: `${r.ratedCount} of ${r.completed} packs rated`
					}
					icon={<Star className="size-4" />}
					label="Brand-voice match"
					tint="from-violet-100 via-white to-pink-50"
				>
					{r.avgVoiceRating === null ? (
						<Dash />
					) : (
						<>
							<CountUp decimals={2} value={r.avgVoiceRating} />
							<span className="text-2xl text-black/40"> / 5</span>
						</>
					)}
				</StatCard>

				<StatCard
					hint="Posts that needed a closer look"
					icon={<AlertTriangle className="size-4" />}
					label="Review-flag rate"
					tint="from-amber-100 via-white to-orange-50"
				>
					{r.reviewFlagRatePct === null ? (
						<Dash />
					) : (
						<>
							<CountUp decimals={1} value={r.reviewFlagRatePct} />%
						</>
					)}
				</StatCard>

				<StatCard
					hint="Per pack: 3 posts + visuals"
					icon={<CheckCircle2 className="size-4" />}
					label="Avg generation time"
					tint="from-cyan-100 via-white to-sky-50"
				>
					<CountUp decimals={1} value={r.avgGenerationSeconds} />s
				</StatCard>
			</motion.div>

			{/* manual vs ContentForge */}
			<motion.section
				variants={fadeUp}
				{...revealProps}
				className="space-y-5 rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
			>
				<h3 className="font-semibold text-lg">Manual vs ContentForge</h3>
				<CompareBar
					barClass="bg-zinc-300"
					label="Manual (writing + designing)"
					minutes={t.baselineMinutesPerPack}
					pct={100}
				/>
				<CompareBar
					barClass="bg-[#d4ff3f]"
					label="ContentForge (generation + your review)"
					minutes={t.aiMinutesPerPackIncludingReview}
					pct={aiPct}
				/>
				<p className="text-black/40 text-xs">{t.assumption}</p>
			</motion.section>

			{/* by industry */}
			<motion.section
				variants={fadeUp}
				{...revealProps}
				className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
			>
				<h3 className="px-6 pt-6 pb-3 font-semibold text-lg">By industry</h3>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[640px] text-left text-sm">
						<thead>
							<tr className="border-black/5 border-b text-black/40 text-xs uppercase tracking-wide">
								<th className="px-6 py-3 font-medium">Industry</th>
								<th className="px-4 py-3 font-medium">Briefs</th>
								<th className="px-4 py-3 font-medium">Completed</th>
								<th className="px-4 py-3 font-medium">Avg time</th>
								<th className="px-4 py-3 font-medium">Voice rating</th>
								<th className="px-6 py-3 font-medium">Flag rate</th>
							</tr>
						</thead>
						<tbody>
							{r.byIndustry.map((row) => (
								<tr
									className="border-black/5 border-b last:border-0 hover:bg-lime-50/50"
									key={row.industry}
								>
									<td className="px-6 py-4 font-medium">{row.industry}</td>
									<td className="px-4 py-4 tabular-nums">{row.briefs}</td>
									<td className="px-4 py-4 tabular-nums">{row.completed}</td>
									<td className="px-4 py-4 tabular-nums">{row.avgSeconds}s</td>
									<td className="px-4 py-4 tabular-nums">
										{row.avgVoiceRating ?? "—"}
									</td>
									<td className="px-6 py-4 tabular-nums">
										{row.reviewFlagRatePct === null
											? "—"
											: `${row.reviewFlagRatePct}%`}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</motion.section>
		</div>
	);
}
