"use client";

import { Copy, Hash, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { fadeUp, staggerContainer } from "~/lib/motion";

type Props = {
	topics?: string[];
	hashtags?: string[];
	/** true while the pack is generating and trends haven't arrived yet */
	loading?: boolean;
};

const SKELETON_TAGS = ["t1", "t2", "t3", "t4", "t5", "t6"];

async function copy(text: string, message: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(message);
	} catch {
		toast.error("Couldn't copy");
	}
}

export function TrendsPanel({ topics, hashtags, loading = false }: Props) {
	const hasData = (topics?.length ?? 0) > 0 || (hashtags?.length ?? 0) > 0;

	return (
		<section className="rounded-[2rem] border border-black/5 bg-gradient-to-br from-cyan-50 via-white to-lime-50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
			<div className="mb-4 flex items-center gap-2">
				<span className="flex size-8 items-center justify-center rounded-full bg-[#d4ff3f]">
					<TrendingUp className="size-4 text-black" />
				</span>
				<h2 className="font-semibold text-lg">What's trending</h2>
			</div>

			{loading && !hasData && (
				<div className="space-y-3">
					<Skeleton className="h-5 w-3/4 rounded-full" />
					<Skeleton className="h-5 w-2/3 rounded-full" />
					<Skeleton className="h-5 w-1/2 rounded-full" />
					<div className="flex flex-wrap gap-2 pt-2">
						{SKELETON_TAGS.map((id) => (
							<Skeleton className="h-7 w-20 rounded-full" key={id} />
						))}
					</div>
				</div>
			)}

			{!loading && !hasData && (
				<p className="text-black/50 text-sm">
					No trend data was found for this topic.
				</p>
			)}

			{hasData && (
				<motion.div
					animate="visible"
					className="space-y-5"
					initial="hidden"
					variants={staggerContainer(0.05)}
				>
					{topics && topics.length > 0 && (
						<div className="space-y-2">
							<p className="font-medium text-black/40 text-xs uppercase tracking-wide">
								Angles
							</p>
							<ul className="space-y-2">
								{topics.map((topic, i) => (
									<motion.li
										className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-2.5 text-black/80 text-sm"
										key={topic}
										variants={fadeUp}
									>
										<span className="mt-0.5 font-semibold text-black/30 text-xs tabular-nums">
											{String(i + 1).padStart(2, "0")}
										</span>
										{topic}
									</motion.li>
								))}
							</ul>
						</div>
					)}

					{hashtags && hashtags.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<p className="flex items-center gap-1 font-medium text-black/40 text-xs uppercase tracking-wide">
									<Hash className="size-3" />
									Hashtags
								</p>
								<Button
									className="h-7 rounded-full text-xs"
									onClick={() =>
										void copy(
											hashtags.map((h) => `#${h}`).join(" "),
											"All hashtags copied",
										)
									}
									size="sm"
									variant="ghost"
								>
									<Copy className="size-3" />
									Copy all
								</Button>
							</div>
							<div className="flex flex-wrap gap-1.5">
								{hashtags.map((tag) => (
									<motion.button
										className="rounded-full bg-white px-3 py-1 font-medium text-sky-700 text-xs shadow-sm ring-1 ring-black/5 transition-colors hover:bg-sky-50"
										key={tag}
										onClick={() => void copy(`#${tag}`, `#${tag} copied`)}
										title="Click to copy"
										type="button"
										variants={fadeUp}
										whileHover={{ scale: 1.06, y: -2 }}
										whileTap={{ scale: 0.95 }}
									>
										#{tag}
									</motion.button>
								))}
							</div>
						</div>
					)}
				</motion.div>
			)}
		</section>
	);
}
