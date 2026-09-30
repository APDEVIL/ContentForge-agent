"use client";

import { useRef } from "react";
import { getMouse, useMouseRef } from "~/hooks/use-mouse-position";
import { useReducedMotion } from "~/hooks/use-reduced-motion";
import { WAVE_COLORS } from "~/lib/constants";
import { gsap, useGSAP } from "~/lib/gsap";
import { cn } from "~/lib/utils";

const BLOBS = [
	{ color: WAVE_COLORS[0], size: 55, left: 2, top: 40, pull: 0.5 },
	{ color: WAVE_COLORS[1], size: 50, left: 28, top: 10, pull: 0.35 },
	{ color: WAVE_COLORS[2], size: 55, left: 52, top: 35, pull: 0.25 },
	{ color: WAVE_COLORS[3], size: 45, left: 68, top: 50, pull: 0.4 },
	{ color: WAVE_COLORS[4], size: 45, left: 40, top: 62, pull: 0.55 },
	{ color: WAVE_COLORS[5], size: 40, left: 12, top: 5, pull: 0.3 },
] as const;

type Props = { className?: string; intensity?: number };

/** Blurred gradient blobs that drift on their own and chase the mouse with a lag. */
export function WaveBackground({ className, intensity = 1 }: Props) {
	const root = useRef<HTMLDivElement>(null);
	const reduced = useReducedMotion();
	useMouseRef();

	useGSAP(
		() => {
			const el = root.current;
			if (!el || reduced) return;
			const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]", el);
			const inners = gsap.utils.toArray<HTMLElement>("[data-inner]", el);

			const movers = blobs.map((b, i) => ({
				x: gsap.quickTo(b, "x", { duration: 0.8 + i * 0.25, ease: "power3" }),
				y: gsap.quickTo(b, "y", { duration: 0.8 + i * 0.25, ease: "power3" }),
			}));

			gsap.to(inners, {
				x: "random(-50, 50)",
				y: "random(-40, 40)",
				scale: "random(0.9, 1.2)",
				duration: "random(4, 7)",
				ease: "sine.inOut",
				repeat: -1,
				repeatRefresh: true,
				yoyo: true,
				stagger: { each: 0.4, from: "random" },
			});

			const tick = () => {
				const m = getMouse();
				if (!m.moved) return;
				const r = el.getBoundingClientRect();
				const dx = m.x - (r.left + r.width / 2);
				const dy = m.y - (r.top + r.height / 2);
				movers.forEach((mv, i) => {
					const pull = (BLOBS[i]?.pull ?? 0.3) * intensity;
					mv.x(dx * pull);
					mv.y(dy * pull);
				});
			};
			gsap.ticker.add(tick);
			return () => gsap.ticker.remove(tick);
		},
		{ dependencies: [reduced, intensity], scope: root },
	);

	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className,
			)}
			ref={root}
		>
			{BLOBS.map((b) => (
				<div
					className="absolute"
					data-blob
					key={b.color}
					style={{
						aspectRatio: "1",
						left: `${b.left}%`,
						top: `${b.top}%`,
						width: `${b.size}%`,
					}}
				>
					<div
						className="size-full rounded-full opacity-80 blur-3xl"
						data-inner
						style={{ background: b.color }}
					/>
				</div>
			))}
		</div>
	);
}
