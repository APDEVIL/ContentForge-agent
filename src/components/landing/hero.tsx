"use client";

import { PenLine, ShieldCheck, Sparkles, Wand2, Zap } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Magnetic } from "~/components/effects/magnetic";
import { WaveBackground } from "~/components/effects/wave-background";
import { Button } from "~/components/ui/button";
import { HERO_FEATURES } from "~/lib/constants";
import { fadeUp, staggerContainer } from "~/lib/motion";

const FEATURES = [
	{ icon: Zap, label: HERO_FEATURES[0] },
	{ icon: PenLine, label: HERO_FEATURES[1] },
	{ icon: ShieldCheck, label: HERO_FEATURES[2] },
];

function Chip({ children }: { children: ReactNode }) {
	return (
		<motion.span
			className="mx-2 inline-flex h-[0.8em] w-[1.25em] translate-y-[0.05em] items-center justify-center rounded-[0.22em] bg-neutral-900 text-[#d4ff3f]"
			whileHover={{ rotate: -8, scale: 1.12 }}
		>
			{children}
		</motion.span>
	);
}

export function Hero() {
	return (
		<section className="px-3 pt-24 md:px-6" id="product">
			<div className="relative mx-auto max-w-6xl overflow-hidden rounded-[3rem] bg-white">
				<WaveBackground />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8),transparent_65%)]" />

				<div className="relative flex flex-col items-center px-6 py-20 text-center md:py-28">
					<motion.span
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 rounded-full bg-white/80 px-3 py-1 font-semibold text-[11px] uppercase tracking-widest shadow-sm"
						initial={{ opacity: 0, y: 10 }}
					>
						Hi, I'm ContentForge
					</motion.span>

					<motion.h1
						animate="visible"
						className="max-w-3xl font-semibold text-5xl leading-[1.05] tracking-tight md:text-7xl"
						initial="hidden"
						variants={staggerContainer(0.12, 0.2)}
					>
						<motion.span className="block" variants={fadeUp}>
							One idea in,
						</motion.span>
						<motion.span className="block" variants={fadeUp}>
							<Chip>
								<Sparkles className="size-[0.5em]" />
							</Chip>
							a week of
						</motion.span>
						<motion.span className="block" variants={fadeUp}>
							on-brand content
							<Chip>
								<Wand2 className="size-[0.5em]" />
							</Chip>
						</motion.span>
					</motion.h1>

					<motion.p
						animate={{ opacity: 1, y: 0 }}
						className="mt-6 max-w-md text-black/70 text-sm md:text-base"
						initial={{ opacity: 0, y: 16 }}
						transition={{ delay: 0.7 }}
					>
						I write captions, pick trending hashtags and create visuals for
						Instagram, LinkedIn and X. You approve every post.
					</motion.p>

					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="mt-8 flex flex-wrap justify-center gap-3"
						initial={{ opacity: 0, y: 16 }}
						transition={{ delay: 0.85 }}
					>
						<Magnetic>
							<Button
								className="h-11 rounded-xl bg-[#d4ff3f] px-6 font-semibold text-black hover:bg-[#c8f22d]"
								data-cursor-label="Go"
								nativeButton={false}
								render={<Link href="/brands" />}
							>
								Start creating
							</Button>
						</Magnetic>
						<Magnetic>
							<Button
								className="h-11 rounded-xl bg-white/60 px-6 backdrop-blur"
								nativeButton={false}
								render={<a href="#how-it-works" />}
								variant="outline"
							>
								See how it works
							</Button>
						</Magnetic>
					</motion.div>

					<ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-black/70 text-xs">
						{FEATURES.map((f) => (
							<li className="flex items-center gap-1.5" key={f.label}>
								<f.icon className="size-3.5" />
								{f.label}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
