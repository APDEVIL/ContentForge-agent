"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Magnetic } from "~/components/effects/magnetic";
import { WaveBackground } from "~/components/effects/wave-background";
import { Button } from "~/components/ui/button";
import { IMAGES } from "~/lib/constants";
import { fadeUp, revealProps } from "~/lib/motion";

export function CtaCard() {
	return (
		<section className="mx-auto max-w-6xl px-3 pb-24 md:px-6">
			<motion.div
				{...revealProps}
				className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 px-8 py-14 md:px-16"
				variants={fadeUp}
			>
				<WaveBackground className="opacity-60" intensity={0.6} />
				<div className="relative grid items-center gap-8 md:grid-cols-2">
					<div className="space-y-5 text-center md:text-left">
						<h2 className="font-semibold text-4xl leading-tight tracking-tight md:text-5xl">
							Your next week of content, done before lunch.
						</h2>
						<p className="text-black/60 text-sm">
							Add your brand, drop in a topic, review, approve, schedule.
						</p>
						<Magnetic>
							<Button
								className="h-11 rounded-xl bg-[#d4ff3f] px-6 font-semibold text-black hover:bg-[#c8f22d]"
								nativeButton={false}
								render={<Link href="/brands" />}
							>
								Start creating
							</Button>
						</Magnetic>
					</div>
					<div className="relative h-72">
						<Image
							alt=""
							className="object-contain"
							fill
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
							sizes="400px"
							src={IMAGES.cta}
						/>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
