import "~/styles/globals.css"; // keep whatever globals.css path you already have

import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import type { ReactNode } from "react";
import { CustomCursor } from "~/components/effects/custom-cursor";
import { ConvexClientProvider } from "~/components/providers/convex-provider";
import { SmoothScroll } from "~/components/providers/smooth-scroll";
import { Toaster } from "~/components/ui/sonner";
import { BRAND, IMAGES } from "~/lib/constants";

const font = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: `${BRAND.name} — ${BRAND.tagline}`,
	description:
		"Captions, hashtags and visuals for Instagram, LinkedIn and X, in your brand voice.",
	openGraph: { images: [IMAGES.og] },
	icons: [{ rel: "icon", url: IMAGES.logoMark }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={`${font.className} bg-[#fdf9ec] text-black antialiased`}>
				<ConvexClientProvider>
					<SmoothScroll>{children}</SmoothScroll>
					<CustomCursor />
					<Toaster position="top-center" />
				</ConvexClientProvider>
			</body>
		</html>
	);
}
