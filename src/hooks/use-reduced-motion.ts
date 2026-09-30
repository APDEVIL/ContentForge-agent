"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
	const mq = window.matchMedia(QUERY);
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

/** true when the user has "reduce motion" turned on. Use it to skip effects. */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(QUERY).matches,
		() => false,
	);
}
