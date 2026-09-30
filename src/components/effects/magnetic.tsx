"use client";

import { type ReactNode, useRef } from "react";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { gsap, useGSAP } from "~/lib/gsap";
import { cn } from "~/lib/utils";

type Props = { children: ReactNode; className?: string; strength?: number };

/** Wrap a button: it gets pulled toward the cursor and springs back. */
export function Magnetic({ children, className, strength = 0.35 }: Props) {
	const ref = useRef<HTMLDivElement>(null);
	const reduced = useReducedMotion();

	useGSAP(
		() => {
			const el = ref.current;
			if (!el || reduced) return;
			const x = gsap.quickTo(el, "x", {
				duration: 0.7,
				ease: "elastic.out(1, 0.5)",
			});
			const y = gsap.quickTo(el, "y", {
				duration: 0.7,
				ease: "elastic.out(1, 0.5)",
			});
			const move = (e: PointerEvent) => {
				const r = el.getBoundingClientRect();
				x((e.clientX - (r.left + r.width / 2)) * strength);
				y((e.clientY - (r.top + r.height / 2)) * strength);
			};
			const leave = () => {
				x(0);
				y(0);
			};
			el.addEventListener("pointermove", move);
			el.addEventListener("pointerleave", leave);
			return () => {
				el.removeEventListener("pointermove", move);
				el.removeEventListener("pointerleave", leave);
			};
		},
		{ dependencies: [reduced, strength], scope: ref },
	);

	return (
		<div className={cn("inline-block", className)} ref={ref}>
			{children}
		</div>
	);
}
