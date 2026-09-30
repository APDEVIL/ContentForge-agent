"use client";

import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandForm } from "~/components/brands/brand-form";
import { Skeleton } from "~/components/ui/skeleton";
import { useSelectedBrand } from "~/hooks/use-selected-brand";
import { IMAGES } from "~/lib/constants";
import { fadeUp, staggerContainer } from "~/lib/motion";
import { cn } from "~/lib/utils";

const SKELETON = ["s1", "s2", "s3", "s4"];

export default function BrandsPage() {
	const router = useRouter();
	const brands = useQuery(api.brands.list);
	const { setBrandId } = useSelectedBrand();

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
					Your brands
				</h1>
				<p className="text-black/60">
					Add a brand, teach ContentForge its voice, then create content.
				</p>
			</header>

			<div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
				<BrandForm
					onCreated={(id) => {
						setBrandId(id);
						router.push(`/brands/${id}`);
					}}
				/>

				<section>
					{brands === undefined && (
						<div className="grid gap-4 sm:grid-cols-2">
							{SKELETON.map((id) => (
								<Skeleton className="h-36 rounded-[2rem]" key={id} />
							))}
						</div>
					)}

					{brands?.length === 0 && (
						<div className="flex flex-col items-center gap-4 rounded-[2rem] border border-black/10 border-dashed bg-white/60 p-10 text-center">
							<Image
								alt=""
								height={140}
								onError={(e) => {
									e.currentTarget.style.display = "none";
								}}
								src={IMAGES.empty.brands}
								width={140}
							/>
							<p className="font-semibold">No brands yet</p>
							<p className="text-black/50 text-sm">
								Add your first brand on the left to get started.
							</p>
						</div>
					)}

					{brands && brands.length > 0 && (
						<motion.ul
							animate="visible"
							className="grid gap-4 sm:grid-cols-2"
							initial="hidden"
							variants={staggerContainer(0.06)}
						>
							{brands.map((brand) => (
								<motion.li
									key={brand._id}
									variants={fadeUp}
									whileHover={{ y: -5 }}
								>
									<Link
										className="block h-full space-y-3 rounded-[2rem] border border-black/5 bg-white/85 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur"
										data-cursor-label="Open"
										href={`/brands/${brand._id}`}
										onClick={() => setBrandId(brand._id)}
									>
										<div className="flex items-center gap-3">
											<span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#d4ff3f] to-cyan-200 font-semibold">
												{brand.name.charAt(0).toUpperCase()}
											</span>
											<div className="min-w-0">
												<p className="truncate font-semibold">{brand.name}</p>
												<p className="truncate text-black/50 text-xs">
													{brand.industry}
												</p>
											</div>
										</div>
										{brand.description && (
											<p className="line-clamp-2 text-black/60 text-sm">
												{brand.description}
											</p>
										)}
										<span
											className={cn(
												"inline-block rounded-full px-2.5 py-0.5 font-medium text-xs",
												brand.voiceProfile
													? "bg-emerald-100 text-emerald-800"
													: "bg-zinc-100 text-zinc-600",
											)}
										>
											{brand.voiceProfile ? "Voice learned" : "No voice yet"}
										</span>
									</Link>
								</motion.li>
							))}
						</motion.ul>
					)}
				</section>
			</div>
		</div>
	);
}
