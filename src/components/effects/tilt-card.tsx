"use client";

import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useSpring,
	useTransform,
} from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { cn } from "~/lib/utils";

type Props = {
	children: ReactNode;
	className?: string;
	glare?: boolean;
	/** maximum tilt in degrees */
	max?: number;
};

const SPRING = { damping: 20, stiffness: 220 };

/** 3D tilt that follows the cursor, with a soft light glare. */
export function TiltCard({
	children,
	className,
	glare = true,
	max = 8,
}: Props) {
	const reduced = useReducedMotion();

	const px = useMotionValue(0.5);
	const py = useMotionValue(0.5);
	const hover = useMotionValue(0);

	const sx = useSpring(px, SPRING);
	const sy = useSpring(py, SPRING);
	const glareOpacity = useSpring(hover, { damping: 25, stiffness: 200 });

	const rotateY = useTransform(sx, [0, 1], [-max, max]);
	const rotateX = useTransform(sy, [0, 1], [max, -max]);
	const gx = useTransform(sx, (v) => `${v * 100}%`);
	const gy = useTransform(sy, (v) => `${v * 100}%`);
	const background = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.55), transparent 55%)`;

	if (reduced) return <div className={className}>{children}</div>;

	return (
		<motion.div
			className={cn("relative", className)}
			onPointerLeave={() => {
				px.set(0.5);
				py.set(0.5);
				hover.set(0);
			}}
			onPointerMove={(e) => {
				const r = e.currentTarget.getBoundingClientRect();
				px.set((e.clientX - r.left) / r.width);
				py.set((e.clientY - r.top) / r.height);
				hover.set(1);
			}}
			style={{ rotateX, rotateY, transformPerspective: 900 }}
		>
			{children}
			{glare && (
				<motion.div
					aria-hidden
					className="pointer-events-none absolute inset-0 rounded-[inherit]"
					style={{ background, opacity: glareOpacity }}
				/>
			)}
		</motion.div>
	);
}
