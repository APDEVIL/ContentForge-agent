"use client";

import { ImageOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { IMAGES, PLATFORM_META, type Platform } from "~/lib/constants";
import { easeOutExpo } from "~/lib/motion";
import { cn } from "~/lib/utils";

type ImageFrameProps = {
	src?: string | null;
	alt: string;
	platform: Platform;
	/** the pack is still generating and this post has no image yet */
	loading?: boolean;
	/** a new image is being generated for this post */
	regenerating?: boolean;
	/** post.imageError from the backend */
	error?: string | null;
	className?: string;
};

function LoadedImage({
	src,
	alt,
	onBroken,
}: {
	src: string;
	alt: string;
	onBroken: () => void;
}) {
	const [loaded, setLoaded] = useState(false);
	return (
		<motion.img
			alt={alt}
			animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.05 }}
			className="absolute inset-0 h-full w-full object-cover"
			initial={{ opacity: 0, scale: 1.05 }}
			onError={onBroken}
			onLoad={() => setLoaded(true)}
			src={src}
			transition={{ duration: 0.6, ease: easeOutExpo }}
		/>
	);
}

export function ImageFrame({
	src,
	alt,
	platform,
	loading = false,
	regenerating = false,
	error,
	className,
}: ImageFrameProps) {
	const meta = PLATFORM_META[platform];
	const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

	const hasImage = !!src && brokenSrc !== src;
	const isLoading = loading && !hasImage;

	return (
		<div
			className={cn(
				"relative w-full overflow-hidden rounded-2xl bg-gradient-to-br",
				meta.gradient,
				meta.aspect,
				className,
			)}
		>
			{hasImage && (
				<LoadedImage
					alt={alt}
					key={src}
					onBroken={() => setBrokenSrc(src ?? null)}
					src={src}
				/>
			)}

			{isLoading && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
					<div className="absolute inset-0 animate-pulse bg-white/30" />
					<motion.img
						alt=""
						animate={{ y: [0, -8, 0] }}
						aria-hidden
						className="relative h-24 w-24 object-contain"
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
						src={IMAGES.generating}
						transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
					/>
					<p className="relative flex items-center gap-2 font-medium text-black/60 text-sm">
						<Loader2 className="size-4 animate-spin" />
						Creating your visual…
					</p>
				</div>
			)}

			{!hasImage && !isLoading && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
					<ImageOff className="size-7 text-black/40" />
					<p className="font-medium text-black/60 text-sm">
						{error ? "Couldn't create this visual" : "No visual yet"}
					</p>
					{error && (
						<p className="line-clamp-2 text-black/40 text-xs">{error}</p>
					)}
					<p className="text-black/40 text-xs">Try Regenerate → New image</p>
				</div>
			)}

			<AnimatePresence>
				{regenerating && (
					<motion.div
						animate={{ opacity: 1 }}
						className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-md"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						key="regen"
					>
						<Loader2 className="size-6 animate-spin text-black/70" />
						<p className="font-medium text-black/70 text-sm">
							Making a new visual…
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
