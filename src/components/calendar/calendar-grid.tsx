"use client";

import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "~/components/ui/button";
import type { Platform } from "~/lib/constants";
import { spring } from "~/lib/motion";
import { cn } from "~/lib/utils";

export const DAY_KEY = "yyyy-MM-dd";
export const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DOT: Record<Platform, string> = {
	instagram: "bg-fuchsia-400",
	linkedin: "bg-sky-500",
	x: "bg-zinc-800",
};

type Props = {
	month: Date;
	onMonthChange: (date: Date) => void;
	onSelect: (date: Date) => void;
	platformsByDay: Map<string, Platform[]>;
	selected: Date;
};

export function CalendarGrid({
	month,
	onMonthChange,
	onSelect,
	platformsByDay,
	selected,
}: Props) {
	const days = eachDayOfInterval({
		end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
		start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
	});

	return (
		<section className="rounded-[2rem] border border-black/5 bg-white/85 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur md:p-6">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="font-semibold text-xl tracking-tight md:text-2xl">
					{format(month, "MMMM yyyy")}
				</h2>
				<div className="flex items-center gap-1.5">
					<Button
						aria-label="Previous month"
						className="rounded-full"
						onClick={() => onMonthChange(subMonths(month, 1))}
						size="icon"
						variant="outline"
					>
						<ChevronLeft className="size-4" />
					</Button>
					<Button
						className="rounded-full"
						onClick={() => {
							const now = new Date();
							onMonthChange(now);
							onSelect(now);
						}}
						size="sm"
						variant="outline"
					>
						Today
					</Button>
					<Button
						aria-label="Next month"
						className="rounded-full"
						onClick={() => onMonthChange(addMonths(month, 1))}
						size="icon"
						variant="outline"
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</div>

			<div className="mb-2 grid grid-cols-7 text-center font-medium text-black/40 text-xs uppercase tracking-wide">
				{WEEKDAYS.map((d) => (
					<span key={d}>{d}</span>
				))}
			</div>

			<AnimatePresence initial={false} mode="wait">
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="grid grid-cols-7 gap-1 md:gap-1.5"
					exit={{ opacity: 0, y: -8 }}
					initial={{ opacity: 0, y: 8 }}
					key={format(month, "yyyy-MM")}
					transition={{ duration: 0.2 }}
				>
					{days.map((day) => {
						const key = format(day, DAY_KEY);
						const platforms = platformsByDay.get(key) ?? [];
						const unique = Array.from(new Set(platforms));
						const isSelected = isSameDay(day, selected);
						const inMonth = isSameMonth(day, month);

						return (
							<button
								aria-label={format(day, "EEEE d MMMM")}
								aria-pressed={isSelected}
								className={cn(
									"relative isolate flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl text-sm transition-colors",
									inMonth ? "text-black" : "text-black/25",
									!isSelected && "hover:bg-lime-100/70",
									isToday(day) && !isSelected && "ring-1 ring-black/30",
								)}
								key={key}
								onClick={() => onSelect(day)}
								type="button"
							>
								{isSelected && (
									<motion.span
										className="absolute inset-0 -z-10 rounded-2xl bg-[#d4ff3f]"
										layoutId="cal-selected"
										transition={spring}
									/>
								)}
								<span className="font-medium">{format(day, "d")}</span>
								<span className="flex h-2 items-center gap-0.5">
									{unique.map((p) => (
										<span
											className={cn("size-1.5 rounded-full", DOT[p])}
											key={p}
										/>
									))}
									{platforms.length > 1 && (
										<span className="ml-0.5 font-semibold text-[9px] text-black/50 leading-none">
											{platforms.length}
										</span>
									)}
								</span>
							</button>
						);
					})}
				</motion.div>
			</AnimatePresence>

			<ul className="mt-5 flex flex-wrap gap-4 text-black/50 text-xs">
				{(Object.keys(DOT) as Platform[]).map((p) => (
					<li className="flex items-center gap-1.5 capitalize" key={p}>
						<span className={cn("size-2 rounded-full", DOT[p])} />
						{p === "x" ? "X" : p}
					</li>
				))}
			</ul>
		</section>
	);
}
