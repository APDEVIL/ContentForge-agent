"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Wand2 } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandPicker } from "~/components/brands/brand-picker";
import { PlatformPicker } from "~/components/brief/platform-picker";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useSelectedBrand } from "~/hooks/use-selected-brand";
import { PLATFORMS, type Platform } from "~/lib/constants";
import { getErrorMessage } from "~/lib/errors";

const IDEAS = [
	"Launch of our new product",
	"Weekend sale announcement",
	"Behind the scenes with our team",
	"Customer story or testimonial",
	"Tips related to what we sell",
];

type Props = { onSubmitted: (packId: Id<"contentPacks">) => void };

export function BriefForm({ onSubmitted }: Props) {
	const { brandId, hydrated, setBrandId } = useSelectedBrand();
	const brand = useQuery(api.brands.get, brandId ? { brandId } : "skip");
	const submit = useMutation(api.briefs.submit);

	const [topic, setTopic] = useState("");
	const [notes, setNotes] = useState("");
	const [platforms, setPlatforms] = useState<Platform[]>([...PLATFORMS]);
	const [sending, setSending] = useState(false);

	// a saved brand that no longer exists
	useEffect(() => {
		if (hydrated && brandId && brand === null) setBrandId(null);
	}, [brand, brandId, hydrated, setBrandId]);

	const canSubmit =
		!sending && !!brandId && topic.trim().length >= 3 && platforms.length > 0;

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!canSubmit || !brandId) return;
		setSending(true);
		try {
			const packId = await submit({
				brandId,
				notes: notes.trim() || undefined,
				platforms,
				topic,
			});
			onSubmitted(packId);
		} catch (err) {
			toast.error("Couldn't start generation", {
				description: getErrorMessage(err),
			});
			setSending(false);
		}
	}

	return (
		<form
			className="space-y-7 rounded-[2rem] border border-black/5 bg-white/85 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur md:p-8"
			onSubmit={onSubmit}
		>
			<div className="space-y-3">
				<Label>1. Which brand is this for?</Label>
				<BrandPicker
					onChange={(id) => setBrandId(id)}
					value={hydrated ? brandId : null}
				/>
				{brand && !brand.voiceProfile && (
					<p className="rounded-2xl bg-amber-50 px-4 py-2.5 text-amber-800 text-xs">
						{brand.name} has no voice profile yet, so posts will use a neutral
						tone.{" "}
						<Link
							className="font-semibold underline"
							href={`/brands/${brand._id}`}
						>
							Learn the voice
						</Link>
					</p>
				)}
			</div>

			<div className="space-y-3">
				<Label htmlFor="brief-topic">
					2. What should the content be about?
				</Label>
				<Textarea
					className="rounded-2xl"
					id="brief-topic"
					maxLength={500}
					onChange={(e) => setTopic(e.target.value)}
					placeholder="e.g. Launching our monsoon hoodie collection this Friday"
					rows={4}
					value={topic}
				/>
				<div className="flex flex-wrap gap-1.5">
					{IDEAS.map((idea) => (
						<button
							className="rounded-full bg-black/5 px-3 py-1 text-black/60 text-xs transition-colors hover:bg-lime-100"
							key={idea}
							onClick={() => setTopic(idea)}
							type="button"
						>
							{idea}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<Label>3. Where will it be posted?</Label>
				<PlatformPicker onChange={setPlatforms} value={platforms} />
			</div>

			<div className="space-y-3">
				<Label htmlFor="brief-notes">
					4. Anything else to include? (optional)
				</Label>
				<Textarea
					className="rounded-2xl"
					id="brief-notes"
					maxLength={500}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="Offer details, dates, a link to mention, words to avoid…"
					rows={3}
					value={notes}
				/>
			</div>

			<Button
				className="h-12 w-full rounded-full bg-[#d4ff3f] font-semibold text-base text-black hover:bg-[#c8f22d]"
				data-cursor-label="Go"
				disabled={!canSubmit}
				type="submit"
			>
				{sending ? (
					<Loader2 className="size-5 animate-spin" />
				) : (
					<Wand2 className="size-5" />
				)}
				Generate content pack
			</Button>
		</form>
	);
}
