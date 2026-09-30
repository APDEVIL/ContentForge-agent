"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAction } from "convex/react";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { getErrorMessage } from "~/lib/errors";
import { fadeUp, staggerContainer } from "~/lib/motion";
import { cn } from "~/lib/utils";

export type VoiceProfile = {
  avoid: string[];
  emojiUsage: string;
  hashtagStyle: string;
  sentenceStyle: string;
  summary: string;
  tone: string[];
  vocabulary: string[];
};

type Props = {
  brandId: Id<"brands">;
  postCount: number;
  profile?: VoiceProfile | null;
};

const MIN_POSTS = 3;

function Chips({ items, className }: { items: string[]; className: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from(new Set(items)).map((item) => (
        <span
          className={cn("rounded-full px-3 py-1 font-medium text-xs", className)}
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <p className="mb-1 font-medium text-black/40 text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="text-black/80 text-sm">{value}</p>
    </div>
  );
}

export function VoiceProfileCard({ brandId, postCount, profile }: Props) {
  const analyze = useAction(api.ai.brandVoice.analyze);
  const [learning, setLearning] = useState(false);
  const enough = postCount >= MIN_POSTS;

  async function learn() {
    setLearning(true);
    try {
      await analyze({ brandId });
      toast.success("Brand voice learned");
    } catch (e) {
      toast.error("Couldn't learn the voice", {
        description: getErrorMessage(e),
      });
    } finally {
      setLearning(false);
    }
  }

  return (
    <section className="space-y-5 rounded-[2rem] border border-black/5 bg-gradient-to-br from-lime-50 via-white to-cyan-50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#d4ff3f]">
            <Sparkles className="size-4 text-black" />
          </span>
          <div>
            <h2 className="font-semibold text-lg">Brand voice</h2>
            <p className="text-black/50 text-sm">
              {enough
                ? "Learned from the brand's past posts."
                : `Add ${MIN_POSTS - postCount} more past post${MIN_POSTS - postCount === 1 ? "" : "s"} to unlock this.`}
            </p>
          </div>
        </div>
        <Button
          className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
          disabled={!enough || learning}
          onClick={() => void learn()}
        >
          {learning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {learning ? "Learning…" : profile ? "Re-learn voice" : "Learn voice"}
        </Button>
      </div>

      {learning && (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-black/10" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-black/10" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-black/10" />
        </div>
      )}

      {!learning && !profile && (
        <p className="rounded-2xl bg-white/70 px-4 py-3 text-black/50 text-sm">
          No voice profile yet. Content will use a neutral, friendly tone until
          you learn one.
        </p>
      )}

      {!learning && profile && (
        <motion.div
          animate="visible"
          className="space-y-5"
          initial="hidden"
          variants={staggerContainer(0.07)}
        >
          <motion.p
            className="text-[15px] text-black/80 leading-relaxed"
            variants={fadeUp}
          >
            {profile.summary}
          </motion.p>

          <motion.div className="space-y-2" variants={fadeUp}>
            <p className="font-medium text-black/40 text-xs uppercase tracking-wide">
              Tone
            </p>
            <Chips className="bg-violet-100 text-violet-800" items={profile.tone} />
          </motion.div>

          {profile.vocabulary.length > 0 && (
            <motion.div className="space-y-2" variants={fadeUp}>
              <p className="font-medium text-black/40 text-xs uppercase tracking-wide">
                Signature words
              </p>
              <Chips
                className="bg-sky-100 text-sky-800"
                items={profile.vocabulary}
              />
            </motion.div>
          )}

          {profile.avoid.length > 0 && (
            <motion.div className="space-y-2" variants={fadeUp}>
              <p className="font-medium text-black/40 text-xs uppercase tracking-wide">
                Never
              </p>
              <Chips className="bg-rose-100 text-rose-800" items={profile.avoid} />
            </motion.div>
          )}

          <motion.div
            className="grid gap-3 sm:grid-cols-3"
            variants={fadeUp}
          >
            <Fact label="Emojis" value={profile.emojiUsage} />
            <Fact label="Sentences" value={profile.sentenceStyle} />
            <Fact label="Hashtags" value={profile.hashtagStyle} />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}