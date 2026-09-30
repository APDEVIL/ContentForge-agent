"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";

const MIN_POSTS = 3;
const SKELETON = ["p1", "p2", "p3"];

/** Posts are separated by a line containing only --- */
function parsePosts(raw: string): string[] {
  return raw
    .split(/^\s*---\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10);
}

export function PastPostsInput({ brandId }: { brandId: Id<"brands"> }) {
  const posts = useQuery(api.brandPosts.list, { brandId });
  const addMany = useMutation(api.brandPosts.addMany);
  const remove = useMutation(api.brandPosts.remove);

  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const parsed = parsePosts(text);
  const count = posts?.length ?? 0;

  async function add() {
    if (parsed.length === 0 || saving) return;
    setSaving(true);
    try {
      const added = await addMany({ brandId, texts: parsed });
      toast.success(`${added} post${added === 1 ? "" : "s"} added`);
      setText("");
    } catch (e) {
      toast.error("Couldn't add posts", { description: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  async function del(postId: Id<"brandPosts">) {
    try {
      await remove({ postId });
    } catch (e) {
      toast.error("Couldn't delete", { description: getErrorMessage(e) });
    }
  }

  return (
    <section className="space-y-5 rounded-[2rem] border border-black/5 bg-white/85 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-lg">Past posts</h2>
          <p className="text-black/50 text-sm">
            Paste posts the brand has already published. Add at least{" "}
            {MIN_POSTS} so ContentForge can learn the voice.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 font-medium text-xs tabular-nums",
            count >= MIN_POSTS
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800",
          )}
        >
          {count} / {MIN_POSTS} minimum
        </span>
      </div>

      <div className="space-y-2">
        <Textarea
          aria-label="Paste past posts"
          className="rounded-2xl"
          onChange={(e) => setText(e.target.value)}
          placeholder={
            "Paste one or more posts.\nPut --- on its own line between posts."
          }
          rows={6}
          value={text}
        />
        <div className="flex items-center justify-between">
          <p className="text-black/40 text-xs">
            {parsed.length > 0
              ? `${parsed.length} post${parsed.length === 1 ? "" : "s"} detected`
              : "Each post needs at least 10 characters"}
          </p>
          <Button
            className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
            disabled={parsed.length === 0 || saving}
            onClick={() => void add()}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add posts
          </Button>
        </div>
      </div>

      {posts === undefined ? (
        <div className="space-y-2">
          {SKELETON.map((id) => (
            <Skeleton className="h-16 w-full rounded-2xl" key={id} />
          ))}
        </div>
      ) : (
        <ul>
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.li
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                key={post._id}
                layout
              >
                <div className="flex items-start gap-3 pb-2.5">
                  <p className="line-clamp-3 flex-1 whitespace-pre-wrap rounded-2xl bg-black/[0.03] px-4 py-3 text-black/70 text-sm">
                    {post.text}
                  </p>
                  <Button
                    aria-label="Delete post"
                    className="rounded-full text-black/40 hover:text-rose-600"
                    onClick={() => void del(post._id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}