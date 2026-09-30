"use client";

import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import {
	endOfMonth,
	endOfWeek,
	format,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { CalendarPlus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandPicker } from "~/components/brands/brand-picker";
import { AutoScheduleDialog } from "~/components/calendar/auto-schedule-dialog";
import {
	CalendarGrid,
	DAY_KEY,
	WEEK_OPTIONS,
} from "~/components/calendar/calendar-grid";
import { type CalendarSlot, SlotCard } from "~/components/calendar/slot-card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useSelectedBrand } from "~/hooks/use-selected-brand";
import { IMAGES, type Platform } from "~/lib/constants";

export default function CalendarPage() {
	const { brandId, hydrated, setBrandId } = useSelectedBrand();
	const brand = useQuery(api.brands.get, brandId ? { brandId } : "skip");

	const [month, setMonth] = useState(() => new Date());
	const [selected, setSelected] = useState(() => new Date());
	const [dialogOpen, setDialogOpen] = useState(false);

	// a saved brand that no longer exists
	useEffect(() => {
		if (hydrated && brandId && brand === null) setBrandId(null);
	}, [brand, brandId, hydrated, setBrandId]);

	const range = useMemo(
		() => ({
			from: startOfWeek(startOfMonth(month), WEEK_OPTIONS).getTime(),
			to: endOfWeek(endOfMonth(month), WEEK_OPTIONS).getTime(),
		}),
		[month],
	);

	const slots = useQuery(
		api.calendar.listRange,
		brandId ? { brandId, ...range } : "skip",
	);

	const { platformsByDay, slotsByDay } = useMemo(() => {
		const platforms = new Map<string, Platform[]>();
		const byDay = new Map<string, CalendarSlot[]>();
		const sorted = [...(slots ?? [])].sort(
			(a, b) => a.scheduledFor - b.scheduledFor,
		);
		for (const slot of sorted) {
			if (!slot.post) continue;
			const key = format(new Date(slot.scheduledFor), DAY_KEY);
			platforms.set(key, [...(platforms.get(key) ?? []), slot.post.platform]);
			byDay.set(key, [...(byDay.get(key) ?? []), slot]);
		}
		return { platformsByDay: platforms, slotsByDay: byDay };
	}, [slots]);

	const daySlots = slotsByDay.get(format(selected, DAY_KEY)) ?? [];
	const monthCount = slots?.length ?? 0;

	function jumpTo(ms: number) {
		const d = new Date(ms);
		setMonth(d);
		setSelected(d);
	}

	return (
		<div className="space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
						Content calendar
					</h1>
					<p className="text-black/60">
						{brand
							? `${monthCount} post${monthCount === 1 ? "" : "s"} scheduled around ${format(month, "MMMM")} for ${brand.name}.`
							: "Pick a brand to see what's scheduled."}
					</p>
				</div>
				<Button
					className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
					disabled={!brandId}
					onClick={() => setDialogOpen(true)}
				>
					<CalendarPlus className="size-4" />
					Auto-schedule a pack
				</Button>
			</header>

			<BrandPicker
				onChange={(id) => setBrandId(id)}
				value={hydrated ? brandId : null}
			/>

			{hydrated && brandId ? (
				<div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
					<CalendarGrid
						month={month}
						onMonthChange={setMonth}
						onSelect={(d) => {
							setSelected(d);
							setMonth(d);
						}}
						platformsByDay={platformsByDay}
						selected={selected}
					/>

					<aside className="space-y-4 lg:sticky lg:top-24">
						<h2 className="font-semibold text-lg">
							{format(selected, "EEEE, d MMMM")}
						</h2>

						{slots === undefined && (
							<Skeleton className="h-40 rounded-[1.75rem]" />
						)}

						{slots !== undefined && daySlots.length === 0 && (
							<div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-black/10 border-dashed bg-white/60 p-8 text-center">
								<Image
									alt=""
									height={110}
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
									src={IMAGES.empty.calendar}
									width={110}
								/>
								<p className="font-medium text-sm">Nothing scheduled</p>
								<p className="text-black/50 text-xs">
									Approve posts in a pack, then add them to the calendar.
								</p>
								<Button
									className="rounded-full"
									nativeButton={false}
									render={<Link href="/brief/new" />}
									size="sm"
									variant="outline"
								>
									Create content
								</Button>
							</div>
						)}

						<AnimatePresence initial={false} mode="popLayout">
							{daySlots.map((slot) => (
								<SlotCard key={slot._id} slot={slot} />
							))}
						</AnimatePresence>
					</aside>
				</div>
			) : (
				hydrated && (
					<p className="rounded-[2rem] border border-black/10 border-dashed bg-white/60 p-10 text-center text-black/50">
						Choose a brand above to open its calendar.
					</p>
				)
			)}

			{brandId && (
				<AutoScheduleDialog
					brandId={brandId}
					onOpenChange={setDialogOpen}
					onScheduled={jumpTo}
					open={dialogOpen}
				/>
			)}
		</div>
	);
}
