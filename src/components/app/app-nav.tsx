"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV, BRAND, IMAGES } from "~/lib/constants";
import { spring } from "~/lib/motion";
import { cn } from "~/lib/utils";

export function AppNav() {
	const pathname = usePathname();

	return (
		<header className="sticky top-4 z-40 mx-auto mt-4 flex w-[min(94%,64rem)] items-center justify-between rounded-full border border-white/60 bg-white/70 py-2 pr-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
			<Link className="flex items-center gap-2 font-semibold" href="/">
				<Image
					alt=""
					height={28}
					onError={(e) => {
						e.currentTarget.style.display = "none";
					}}
					src={IMAGES.logoMark}
					width={28}
				/>
				<span className="hidden sm:inline">{BRAND.name}</span>
			</Link>

			<nav className="flex items-center gap-1">
				{APP_NAV.map((item) => {
					const active =
						pathname === item.href || pathname.startsWith(`${item.href}/`);
					return (
						<Link
							className={cn(
								"relative isolate rounded-full px-3 py-2 text-sm transition-colors sm:px-4",
								active ? "text-black" : "text-black/60 hover:text-black",
							)}
							href={item.href}
							key={item.href}
						>
							{active && (
								<motion.span
									className="absolute inset-0 -z-10 rounded-full bg-[#d4ff3f]"
									layoutId="app-nav-pill"
									transition={spring}
								/>
							)}
							{item.label}
						</Link>
					);
				})}
			</nav>
		</header>
	);
}
