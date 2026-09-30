"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { REVIEW_FLAG_LABELS } from "~/lib/constants";
import { fadeUp, staggerContainer } from "~/lib/motion";
import { cn } from "~/lib/utils";

export function ReviewFlags({
	flags,
	className,
}: {
	flags: string[];
	className?: string;
}) {
	if (flags.length === 0) {
		return (
			<div
				className={cn(
					"inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 text-xs",
					className,
				)}
			>
				<CheckCircle2 className="size-3.5" />
				No issues found
			</div>
		);
	}

	return (
		<motion.ul
			animate="visible"
			className={cn("flex flex-wrap gap-1.5", className)}
			initial="hidden"
			variants={staggerContainer(0.06)}
		>
			{flags.map((flag) => (
				<motion.li
					className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-800 text-xs"
					key={flag}
					variants={fadeUp}
				>
					<AlertTriangle className="size-3.5" />
					{REVIEW_FLAG_LABELS[flag] ?? flag.replaceAll("_", " ")}
				</motion.li>
			))}
		</motion.ul>
	);
}
