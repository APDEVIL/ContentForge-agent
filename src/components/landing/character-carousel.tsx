"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { CAROUSEL_CARDS } from "~/lib/constants";
import { fadeUp, revealProps, staggerContainer } from "~/lib/motion";

const GRADIENTS = [
	"from-sky-200 via-cyan-100 to-yellow-100",
	"from-blue-200 via-sky-100 to-amber-100",
	"from-cyan-200 via-sky-100 to-lime-100",
	"from-violet-200 via-sky-100 to-yellow-100",
	"from-sky-300 via-cyan-100 to-orange-100",
];

export function CharacterCarousel() {
	return (
		<section className="py-16" id="platforms">
			<motion.div
				{...revealProps}
				className="scrollbar-none flex snap-x gap-5 overflow-x-auto px-6 pb-6 md:justify-center"
				data-cursor
				data-cursor-label="Scroll"
				variants={staggerContainer(0.1)}
			>
				{CAROUSEL_CARDS.map((card, i) => (
					<motion.div
						className={`relative h-[26rem] w-64 shrink-0 snap-center overflow-hidden rounded-[2.5rem] bg-gradient-to-b ${GRADIENTS[i % GRADIENTS.length]}`}
						key={card.label}
						variants={fadeUp}
						whileHover={{ y: -12, rotate: i % 2 ? 1.5 : -1.5 }}
					>
						<span className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 font-medium text-xs shadow-sm">
							{card.label}
						</span>
						<Image
							alt={card.label}
							className="object-contain object-bottom"
							fill
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
							sizes="256px"
							src={card.src}
						/>
					</motion.div>
				))}
			</motion.div>
		</section>
	);
}
