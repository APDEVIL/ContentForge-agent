"use client";

import type { Id } from "convex/_generated/dataModel";
import { useCallback, useSyncExternalStore } from "react";

const KEY = "contentforge:selectedBrandId";
const EVENT = "contentforge:brand-change";

function subscribe(callback: () => void) {
	window.addEventListener("storage", callback); // other tabs
	window.addEventListener(EVENT, callback); // this tab
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(EVENT, callback);
	};
}

function getSnapshot(): string | null {
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

/**
 * Remembers which brand the user is working on (there is no login).
 * `hydrated` is false on the server and the first render, so you can show a
 * skeleton instead of flashing "select a brand".
 */
export function useSelectedBrand() {
	const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
	const hydrated = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const setBrandId = useCallback((id: Id<"brands"> | null) => {
		try {
			if (id) localStorage.setItem(KEY, id);
			else localStorage.removeItem(KEY);
		} catch {
			// storage blocked; ignore
		}
		window.dispatchEvent(new Event(EVENT));
	}, []);

	return {
		brandId: (stored as Id<"brands"> | null) ?? null,
		setBrandId,
		hydrated,
	};
}
