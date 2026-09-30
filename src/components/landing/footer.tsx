import { BRAND } from "~/lib/constants";

export function Footer() {
	return (
		<footer className="border-black/5 border-t px-6 py-8 text-center text-black/50 text-sm">
			<p className="font-medium text-black/70">{BRAND.name}</p>
			<p>{BRAND.tagline}</p>
		</footer>
	);
}
