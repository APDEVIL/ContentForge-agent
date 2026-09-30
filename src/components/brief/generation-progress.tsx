"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AlertTriangle, ArrowRight, Check, Circle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { IMAGES, PACK_STAGES } from "~/lib/constants";
import { cn } from "~/lib/utils";

type Props = {
  onRetry?: () => void;
  packId: Id<"contentPacks">;
};

export function GenerationProgress({ onRetry, packId }: Props) {
  const router = useRouter();
  const data = useQuery(api.contentPacks.get, { packId });
  const status = data?.pack.status;

  useEffect(() => {
    if (status !== "ready") return;
    const t = setTimeout(() => router.push(`/packs/${packId}`), 1200);
    return () => clearTimeout(t);
  }, [status, packId, router]);

  if (data === undefined) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (data === null) {
    return (
      <p className="rounded-[2rem] bg-white/85 p-8 text-center text-black/60">
        We couldn't find this pack.
      </p>
    );
  }

  const { pack, posts } = data;

  if (pack.status === "failed") {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center"
        initial={{ opacity: 0, y: 12 }}
      >
        <AlertTriangle className="mx-auto size-8 text-rose-600" />
        <h2 className="font-semibold text-xl">Generation didn't finish</h2>
        <p className="text-rose-800 text-sm">
          {pack.error ?? "Something went wrong while creating your content."}
        </p>
        {onRetry && (
          <Button
            className="rounded-full"
            onClick={onRetry}
            variant="outline"
          >
            Try again
          </Button>
        )}
      </motion.div>
    );
  }

  const ready = pack.status === "ready";
  const lastIdx = PACK_STAGES.length - 1;
  const current = ready
    ? lastIdx
    : Math.max(
        0,
        PACK_STAGES.findIndex((s) => s === pack.stage),
      );
  const pct = ready ? 100 : Math.max(8, (current / lastIdx) * 100 + 8);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 rounded-[2rem] border border-black/5 bg-white/85 p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur"
      initial={{ opacity: 0, y: 12 }}
    >
      <motion.img
        alt=""
        animate={{ y: [0, -10, 0] }}
        aria-hidden
        className="mx-auto h-32 w-32 object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        src={IMAGES.generating}
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
      />

      <div className="space-y-2">
        <h2 className="font-semibold text-2xl tracking-tight">
          {ready ? "Your pack is ready" : "Creating your content…"}
        </h2>
        <p className="text-black/50 text-sm">
          {posts.length > 0
            ? `${posts.length} caption${posts.length === 1 ? "" : "s"} written so far`
            : "This usually takes under a minute."}
        </p>
      </div>

      <Progress className="h-2.5" value={pct} />

      <ol className="mx-auto max-w-sm space-y-3 text-left">
        {PACK_STAGES.map((stage, i) => {
          const done = ready || i < current;
          const active = !ready && i === current;
          return (
            <li
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                done || active ? "text-black" : "text-black/30",
              )}
              key={stage}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full",
                  done && "bg-[#d4ff3f]",
                  active && "bg-black text-white",
                )}
              >
                {done && <Check className="size-3.5" />}
                {active && <Loader2 className="size-3.5 animate-spin" />}
                {!done && !active && <Circle className="size-3.5" />}
              </span>
              {stage}
            </li>
          );
        })}
      </ol>

      {ready && (
        <Button
          className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
          nativeButton={false}
          render={<Link href={`/packs/${packId}`} />}
        >
          Review your posts
          <ArrowRight className="size-4" />
        </Button>
      )}
    </motion.div>
  );
}