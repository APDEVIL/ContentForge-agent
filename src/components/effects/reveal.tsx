"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { easeOutExpo } from "~/lib/motion";

type Direction = "down" | "left" | "none" | "right" | "up";

const OFFSETS: Record<Direction, { x: number; y: number }> = {
	down: { x: 0, y: -1 },
	left: { x: 1, y: 0 },
	none: { x: 0, y: 0 },
	right: { x: -1, y: 0 },
	up: { x: 0, y: 1 },
};

type Props = {
	children: ReactNode;
	className?: string;
	delay?: number;
	direction?: Direction;
	distance?: number;
	duration?: number;
	once?: boolean;
};

/** Fades and slides its children in when they scroll into view. */
export function Reveal({
	children,
	className,
	delay = 0,
	direction = "up",
	distance = 32,
	duration = 0.7,
	once = true,
}: Props) {
	const reduced = useReducedMotion();
	if (reduced) return <div className={className}>{children}</div>;

	const offset = OFFSETS[direction];

	return (
		<motion.div
			className={className}
			initial={{
				opacity: 0,
				x: offset.x * distance,
				y: offset.y * distance,
			}}
			transition={{ delay, duration, ease: easeOutExpo }}
			viewport={{ margin: "-80px", once }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
		>
			{children}
		</motion.div>
	);
}
