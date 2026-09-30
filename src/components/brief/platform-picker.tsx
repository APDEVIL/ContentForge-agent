"use client";

import { useState } from "react";
import { PLATFORM_META, PLATFORMS, type Platform } from "~/lib/constants";

type Props = {
	onChange: (value: Platform[]) => void;
	value: Platform[];
};

function PlatformIcon({ src }: { src: string }) {
	const [hidden, setHidden] = useState(false);
	if (hidden) return null;
	return (
		<img
			alt=""
			aria-hidden
			className="size-6 object-contain"
			onError={() => setHidden(true)}
			src={src}
		/>
	);
}

export function PlatformPicker({ onChange, value }: Props) {
	function toggle(platform: Platform) {
		// keep the original platform order
		onChange(
			PLATFORMS.filter((p) =>
				p === platform ? !value.includes(p) : value.includes(p),
			),
		);
	}

	return (
		<fieldset className="grid gap-3 border-0 p-0 sm:grid-cols-3">
			<legend className="sr-only">Platforms</legend>
			{PLATFORMS.map((platform) => {
				const meta = PLATFORM_META[platform];
				return (
					<label
						className="relative flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 transition-all hover:-translate-y-0.5 has-[:checked]:border-black has-[:checked]:bg-[#d4ff3f] has-[:focus-visible]:ring-2"
						key={platform}
					>
						<input
							checked={value.includes(platform)}
							className="sr-only"
							onChange={() => toggle(platform)}
							type="checkbox"
							value={platform}
						/>
						<PlatformIcon src={meta.icon} />
						<span className="text-sm">
							<span className="block font-semibold">{meta.label}</span>
							<span className="block text-black/50 text-xs">
								{meta.maxChars} chars · {meta.maxHashtags} tags
							</span>
						</span>
					</label>
				);
			})}
		</fieldset>
	);
}
