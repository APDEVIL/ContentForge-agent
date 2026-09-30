"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type MouseState = {
	x: number; // px, viewport coordinates
	y: number;
	nx: number; // 0..1 across the viewport
	ny: number;
	vx: number; // velocity, px per ~16ms (only updates on move; decay it yourself)
	vy: number;
	speed: number;
	inside: boolean; // pointer is inside the window
	pressed: boolean;
	moved: boolean; // true after the first move
};

// One shared mutable state + ONE set of window listeners for the whole app.
const state: MouseState = {
	x: 0,
	y: 0,
	nx: 0.5,
	ny: 0.5,
	vx: 0,
	vy: 0,
	speed: 0,
	inside: false,
	pressed: false,
	moved: false,
};

type Listener = (s: MouseState) => void;
const listeners = new Set<Listener>();
let lastX = 0;
let lastY = 0;
let lastT = 0;

function emit() {
	for (const listener of listeners) {
		listener(state);
	}
}

function onMove(e: PointerEvent) {
	const now = performance.now();
	const dt = Math.max(now - lastT, 1);
	if (state.moved) {
		state.vx = ((e.clientX - lastX) / dt) * 16;
		state.vy = ((e.clientY - lastY) / dt) * 16;
		state.speed = Math.hypot(state.vx, state.vy);
	}
	lastX = e.clientX;
	lastY = e.clientY;
	lastT = now;
	state.x = e.clientX;
	state.y = e.clientY;
	state.nx = e.clientX / window.innerWidth;
	state.ny = e.clientY / window.innerHeight;
	state.inside = true;
	state.moved = true;
	emit();
}

const onEnter = () => {
	state.inside = true;
	emit();
};
const onLeave = () => {
	state.inside = false;
	emit();
};
const onDown = () => {
	state.pressed = true;
	emit();
};
const onUp = () => {
	state.pressed = false;
	emit();
};

function attach() {
	window.addEventListener("pointermove", onMove, { passive: true });
	window.addEventListener("pointerdown", onDown, { passive: true });
	window.addEventListener("pointerup", onUp, { passive: true });
	document.documentElement.addEventListener("mouseenter", onEnter);
	document.documentElement.addEventListener("mouseleave", onLeave);
}

function detach() {
	window.removeEventListener("pointermove", onMove);
	window.removeEventListener("pointerdown", onDown);
	window.removeEventListener("pointerup", onUp);
	document.documentElement.removeEventListener("mouseenter", onEnter);
	document.documentElement.removeEventListener("mouseleave", onLeave);
}

/** Low-level subscribe. Listeners attach on first subscriber, detach on last. */
export function subscribeMouse(listener: Listener): () => void {
	if (typeof window === "undefined") return () => {};
	if (listeners.size === 0) attach();
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) detach();
	};
}

/** Read the live state directly (use inside gsap.ticker / rAF loops). */
export function getMouse(): MouseState {
	return state;
}

/**
 * Stable ref to the shared mouse state. Does NOT cause re-renders, which makes
 * it the right choice for the cursor and wave background.
 */
export function useMouseRef() {
	const ref = useRef<MouseState>(state);
	useEffect(() => subscribeMouse(() => {}), []);
	return ref;
}

/** Re-renders on move (rAF-throttled). Use sparingly. */
export function useMousePosition() {
	const [pos, setPos] = useState({ x: 0, y: 0, nx: 0.5, ny: 0.5 });

	useEffect(() => {
		let raf = 0;
		const unsub = subscribeMouse((s) => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				setPos({ x: s.x, y: s.y, nx: s.nx, ny: s.ny });
			});
		});
		return () => {
			unsub();
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return pos;
}

/** true on devices with a real mouse. Touch devices skip the custom cursor. */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function subscribeFine(callback: () => void) {
	const mq = window.matchMedia(FINE_POINTER);
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

export function useIsFinePointer(): boolean {
	return useSyncExternalStore(
		subscribeFine,
		() => window.matchMedia(FINE_POINTER).matches,
		() => false,
	);
}
