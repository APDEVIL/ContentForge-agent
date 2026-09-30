import type { Transition, Variants } from "motion/react";

export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const spring: Transition = {
	type: "spring",
	stiffness: 260,
	damping: 24,
};

export const softSpring: Transition = {
	type: "spring",
	stiffness: 120,
	damping: 20,
	mass: 0.8,
};

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: easeOutExpo },
	},
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.92 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.6, ease: easeOutExpo },
	},
};

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -40 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: easeOutExpo },
	},
};

export const slideInRight: Variants = {
	hidden: { opacity: 0, x: 40 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: easeOutExpo },
	},
};

/** Parent variant that staggers its children. */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
	hidden: {},
	visible: {
		transition: { staggerChildren: stagger, delayChildren: delay },
	},
});

/** Spread onto a motion element: <motion.div {...hoverLift} /> */
export const hoverLift = {
	whileHover: { y: -6, scale: 1.02 },
	whileTap: { scale: 0.97 },
	transition: spring,
};

export const hoverPop = {
	whileHover: { scale: 1.06 },
	whileTap: { scale: 0.94 },
	transition: spring,
};

/** Default scroll-reveal props: <motion.div {...revealProps} variants={fadeUp} /> */
export const revealProps = {
	initial: "hidden",
	whileInView: "visible",
	viewport: { once: true, margin: "-80px" },
} as const;
