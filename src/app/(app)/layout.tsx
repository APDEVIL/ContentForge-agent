import type { ReactNode } from "react";
import { AppNav } from "~/components/app/app-nav";
import { WaveBackground } from "~/components/effects/wave-background";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative min-h-screen">
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 -z-10 opacity-40"
			>
				<WaveBackground intensity={0.4} />
			</div>
			<AppNav />
			<main className="mx-auto w-[min(94%,64rem)] py-10">{children}</main>
		</div>
	);
}
