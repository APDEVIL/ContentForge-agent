"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { STEPS } from "~/lib/constants";
import { slideInLeft, slideInRight } from "~/lib/motion";
import { cn } from "~/lib/utils";

export function Steps() {
	return (
		<section className="mx-auto max-w-5xl px-4 py-20" id="how-it-works">
			<h2 className="mb-14 text-center font-semibold text-4xl tracking-tight md:text-5xl">
				How it works
			</h2>

			<div className="space-y-8">
				{STEPS.map((step, i) => {
					const flip = i % 2 === 1;
					return (
						<div
							className="grid items-center gap-6 md:grid-cols-2"
							key={step.number}
						>
							<motion.div
								className={cn(
									"space-y-2",
									flip ? "md:order-2" : "md:text-right",
								)}
								initial="hidden"
								variants={flip ? slideInRight : slideInLeft}
								viewport={{ once: true, margin: "-80px" }}
								whileInView="visible"
							>
								<p className="font-semibold text-black/30 text-sm">
									{step.number}
								</p>
								<h3 className="font-semibold text-2xl">{step.title}</h3>
								<p className="text-black/60 text-sm">{step.body}</p>
							</motion.div>

							<motion.div
								className="relative h-56 overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-200 via-cyan-100 to-yellow-100"
								data-cursor
								initial="hidden"
								variants={flip ? slideInLeft : slideInRight}
								viewport={{ once: true, margin: "-80px" }}
								whileHover={{ scale: 1.03 }}
								whileInView="visible"
							>
								<Image
									alt={step.title}
									className="object-contain p-4"
									fill
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
									sizes="(min-width: 768px) 480px, 100vw"
									src={step.image}
								/>
							</motion.div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
