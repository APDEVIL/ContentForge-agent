"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Magnetic } from "~/components/effects/magnetic";
import { Button } from "~/components/ui/button";
import { BRAND, IMAGES, LANDING_NAV } from "~/lib/constants";
import { easeOutExpo } from "~/lib/motion";

export function Navbar() {
	return (
		<motion.header
			animate={{ y: 0, opacity: 1 }}
			className="fixed inset-x-0 top-4 z-50 mx-auto flex w-[min(92%,64rem)] items-center justify-between rounded-full border border-white/60 bg-white/70 py-2 pr-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl"
			initial={{ y: -30, opacity: 0 }}
			transition={{ duration: 0.7, ease: easeOutExpo }}
		>
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
				{BRAND.name}
			</Link>

			<nav className="hidden items-center gap-6 text-black/70 text-sm md:flex">
				{LANDING_NAV.map((l) => (
					<a
						className="transition-colors hover:text-black"
						href={l.href}
						key={l.href}
					>
						{l.label}
					</a>
				))}
			</nav>

			<Magnetic>
				<Button
					className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
					nativeButton={false}
					render={<Link href="/brands" />}
				>
					Open app
				</Button>
			</Magnetic>
		</motion.header>
	);
}
