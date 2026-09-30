/** Turns a Convex error into a short, readable message. */
export function getErrorMessage(
	e: unknown,
	fallback = "Something went wrong",
): string {
	if (e instanceof Error) {
		const m = /Uncaught Error:\s*(.+?)(?:\n|$)/.exec(e.message);
		return (m?.[1] ?? e.message).slice(0, 160);
	}
	return fallback;
}
