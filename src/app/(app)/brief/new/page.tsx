"use client";

import type { Id } from "convex/_generated/dataModel";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BriefForm } from "~/components/brief/brief-form";
import { GenerationProgress } from "~/components/brief/generation-progress";

export default function NewBriefPage() {
	const [packId, setPackId] = useState<Id<"contentPacks"> | null>(null);

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
					{packId ? "Generating…" : "New brief"}
				</h1>
				<p className="text-black/60">
					{packId
						? "Sit tight. We'll open your pack when it's ready."
						: "Tell us the idea. We'll write it for every platform."}
				</p>
			</header>

			<AnimatePresence mode="wait">
				{packId ? (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -12 }}
						initial={{ opacity: 0, y: 12 }}
						key="progress"
					>
						<GenerationProgress
							onRetry={() => setPackId(null)}
							packId={packId}
						/>
					</motion.div>
				) : (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -12 }}
						initial={{ opacity: 0, y: 12 }}
						key="form"
					>
						<BriefForm onSubmitted={setPackId} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
