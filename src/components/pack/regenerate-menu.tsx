"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAction } from "convex/react";
import { ImageIcon, RefreshCw, Type, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Textarea } from "~/components/ui/textarea";

export type RegenBusy = "caption" | "image" | null;

type Props = {
	postId: Id<"posts">;
	disabled?: boolean;
	onBusyChange?: (busy: RegenBusy) => void;
};

function errorMessage(e: unknown, fallback: string) {
	if (e instanceof Error) {
		const m = /Uncaught Error:\s*(.+?)(?:\n|$)/.exec(e.message);
		return (m?.[1] ?? e.message).slice(0, 160);
	}
	return fallback;
}

const DIALOG_COPY = {
	caption: {
		title: "Rewrite with instructions",
		description:
			"Tell ContentForge what to change. The new caption goes back to review.",
		placeholder: "e.g. Make it funnier and shorter, and end with a question",
		action: "Rewrite caption",
	},
	image: {
		title: "Describe the visual you want",
		description: "The new image replaces the current one.",
		placeholder:
			"e.g. A cozy cafe table in morning light, shot from above, warm tones",
		action: "Create image",
	},
} as const;

export function RegenerateMenu({ postId, disabled, onBusyChange }: Props) {
	const regenCaption = useAction(api.ai.regenerate.caption);
	const regenImage = useAction(api.ai.regenerate.image);

	const [busy, setBusy] = useState<RegenBusy>(null);
	const [dialog, setDialog] = useState<"caption" | "image" | null>(null);
	const [text, setText] = useState("");

	async function run(kind: "caption" | "image", input?: string) {
		if (busy) return;
		setBusy(kind);
		onBusyChange?.(kind);
		try {
			const value = input?.trim() || undefined;
			if (kind === "caption") {
				await regenCaption({ postId, instruction: value });
				toast.success("New caption ready", {
					description: "It's back in review.",
				});
			} else {
				await regenImage({ postId, imagePrompt: value });
				toast.success("New visual ready");
			}
		} catch (e) {
			toast.error("Couldn't regenerate", {
				description: errorMessage(e, "Please try again."),
			});
		} finally {
			setBusy(null);
			onBusyChange?.(null);
		}
	}

	function openDialog(kind: "caption" | "image") {
		setText("");
		setDialog(kind);
	}

	function submitDialog() {
		if (!dialog) return;
		const kind = dialog;
		const value = text;
		setDialog(null);
		void run(kind, value);
	}

	const copy = dialog ? DIALOG_COPY[dialog] : null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							className="rounded-full"
							disabled={disabled || busy !== null}
							size="sm"
							variant="outline"
						/>
					}
				>
					<RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
					{busy === "caption"
						? "Rewriting…"
						: busy === "image"
							? "Creating…"
							: "Regenerate"}
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-60 rounded-2xl">
					<DropdownMenuGroup>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Caption
						</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => void run("caption")}>
							<Type className="size-4" />
							New caption
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => openDialog("caption")}>
							<Wand2 className="size-4" />
							Caption with instructions…
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Visual
						</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => void run("image")}>
							<ImageIcon className="size-4" />
							New image
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => openDialog("image")}>
							<Wand2 className="size-4" />
							Image with my idea…
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog
				onOpenChange={(open) => {
					if (!open) setDialog(null);
				}}
				open={dialog !== null}
			>
				<DialogContent className="rounded-3xl sm:max-w-md">
					{copy && (
						<>
							<DialogHeader>
								<DialogTitle>{copy.title}</DialogTitle>
								<DialogDescription>{copy.description}</DialogDescription>
							</DialogHeader>
							<Textarea
								className="rounded-2xl"
								onChange={(e) => setText(e.target.value)}
								onKeyDown={(e) => {
									if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
										submitDialog();
								}}
								placeholder={copy.placeholder}
								rows={4}
								value={text}
							/>
							<DialogFooter>
								<Button
									className="rounded-full"
									onClick={() => setDialog(null)}
									variant="ghost"
								>
									Cancel
								</Button>
								<Button
									className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
									onClick={submitDialog}
								>
									{copy.action}
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
