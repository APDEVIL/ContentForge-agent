"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect } from "react";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { gsap, ScrollTrigger } from "~/lib/gsap";

export function SmoothScroll({ children }: { children: ReactNode }) {
	const reduced = useReducedMotion();

	useEffect(() => {
		if (reduced) return;
		const lenis = new Lenis({ lerp: 0.1 });
		lenis.on("scroll", ScrollTrigger.update);
		const tick = (t: number) => lenis.raf(t * 1000);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);
		return () => {
			gsap.ticker.remove(tick);
			lenis.destroy();
		};
	}, [reduced]);

	return <>{children}</>;
}
