"use client";

import { useRef } from "react";
import {
	getMouse,
	useIsFinePointer,
	useMouseRef,
} from "~/hooks/use-mouse-position";
import { gsap, useGSAP } from "~/lib/gsap";

/**
 * Hover any <a>, <button> or [data-cursor] to grow the ring.
 * Add data-cursor-label="View" to show text inside it.
 */
function Cursor() {
	const dot = useRef<HTMLDivElement>(null);
	const ring = useRef<HTMLDivElement>(null);
	const circle = useRef<HTMLDivElement>(null);
	const label = useRef<HTMLSpanElement>(null);
	useMouseRef();

	useGSAP(() => {
		const d = dot.current;
		const r = ring.current;
		const c = circle.current;
		const l = label.current;
		if (!d || !r || !c || !l) return;

		gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
		const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
		const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });

		const tick = () => {
			const m = getMouse();
			if (!m.moved) return;
			const o = m.inside ? 1 : 0;
			gsap.set(d, { x: m.x, y: m.y, opacity: o });
			gsap.set(r, { opacity: o });
			rx(m.x);
			ry(m.y);
		};

		const over = (e: PointerEvent) => {
			const t = (e.target as Element | null)?.closest<HTMLElement>(
				"a, button, [data-cursor]",
			);
			const text = t?.dataset.cursorLabel ?? "";
			l.textContent = text;
			gsap.to(c, {
				scale: t ? (text ? 2.4 : 1.7) : 1,
				backgroundColor: t ? "rgba(212,255,63,0.85)" : "rgba(212,255,63,0)",
				duration: 0.3,
				ease: "power3.out",
			});
			gsap.to(l, { opacity: text ? 1 : 0, duration: 0.2 });
		};

		document.addEventListener("pointerover", over);
		gsap.ticker.add(tick);
		document.documentElement.classList.add("cf-cursor");
		return () => {
			document.removeEventListener("pointerover", over);
			gsap.ticker.remove(tick);
			document.documentElement.classList.remove("cf-cursor");
		};
	});

	return (
		<>
			<style>
				{
					".cf-cursor, .cf-cursor *:not(input):not(textarea){cursor:none !important}"
				}
			</style>
			<div
				className="pointer-events-none fixed top-0 left-0 z-[9999] size-2 rounded-full bg-black"
				ref={dot}
			/>
			<div
				className="pointer-events-none fixed top-0 left-0 z-[9998] size-10"
				ref={ring}
			>
				<div
					className="size-full rounded-full border border-black/60"
					ref={circle}
				/>
				<span
					className="absolute inset-0 grid place-items-center font-semibold text-[10px] text-black opacity-0"
					ref={label}
				/>
			</div>
		</>
	);
}

export function CustomCursor() {
	const fine = useIsFinePointer();
	return fine ? <Cursor /> : null;
}
