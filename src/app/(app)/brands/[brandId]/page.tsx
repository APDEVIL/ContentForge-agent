"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PastPostsInput } from "~/components/brands/past-posts-input";
import { VoiceProfileCard } from "~/components/brands/voice-profile-card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useSelectedBrand } from "~/hooks/use-selected-brand";

export default function BrandDetailPage() {
	const params = useParams<{ brandId: string }>();
	const brandId = params.brandId as Id<"brands">;
	const brand = useQuery(api.brands.get, { brandId });
	const posts = useQuery(api.brandPosts.list, { brandId });
	const { setBrandId } = useSelectedBrand();

	if (brand === undefined) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-24 rounded-[2rem]" />
				<Skeleton className="h-64 rounded-[2rem]" />
			</div>
		);
	}

	if (brand === null) {
		return (
			<div className="space-y-4 py-16 text-center">
				<p className="font-semibold text-xl">Brand not found</p>
				<Button
					nativeButton={false}
					render={<Link href="/brands" />}
					variant="outline"
				>
					Back to brands
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Link
				className="inline-flex items-center gap-1.5 text-black/50 text-sm hover:text-black"
				href="/brands"
			>
				<ArrowLeft className="size-4" />
				All brands
			</Link>

			<header className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<span className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#d4ff3f] to-cyan-200 font-semibold text-2xl">
						{brand.logoUrl ? (
							<img
								alt={`${brand.name} logo`}
								className="size-full object-cover"
								src={brand.logoUrl}
							/>
						) : (
							brand.name.charAt(0).toUpperCase()
						)}
					</span>
					<div>
						<h1 className="font-semibold text-3xl tracking-tight">
							{brand.name}
						</h1>
						<p className="text-black/50 text-sm">{brand.industry}</p>
					</div>
				</div>

				<Button
					className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
					nativeButton={false}
					onClick={() => setBrandId(brandId)}
					render={<Link href="/brief/new" />}
				>
					<Wand2 className="size-4" />
					Create content
				</Button>
			</header>

			{brand.description && (
				<p className="max-w-2xl text-black/60">{brand.description}</p>
			)}

			<VoiceProfileCard
				brandId={brandId}
				postCount={posts?.length ?? 0}
				profile={brand.voiceProfile}
			/>
			<PastPostsInput brandId={brandId} />
		</div>
	);
}
