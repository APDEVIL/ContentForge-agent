"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, ArrowLeft, CalendarPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PostCard } from "~/components/pack/post-card";
import { TrendsPanel } from "~/components/pack/trends-panel";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { PLATFORMS } from "~/lib/constants";
import { getErrorMessage } from "~/lib/errors";

export default function PackPage() {
  const params = useParams<{ packId: string }>();
  const packId = params.packId as Id<"contentPacks">;
  const router = useRouter();

  const data = useQuery(api.contentPacks.get, { packId });
  const autoSchedule = useMutation(api.calendar.autoSchedulePack);
  const [scheduling, setScheduling] = useState(false);

  const posts = useMemo(
    () =>
      data
        ? [...data.posts].sort(
            (a, b) =>
              PLATFORMS.indexOf(a.platform) - PLATFORMS.indexOf(b.platform),
          )
        : [],
    [data],
  );

  if (data === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="font-semibold text-xl">Pack not found</p>
        <Button
          nativeButton={false}
          render={<Link href="/brief/new" />}
          variant="outline"
        >
          Create a new brief
        </Button>
      </div>
    );
  }

  const { pack } = data;
  const generating = pack.status === "generating";
  const approved = posts.filter((p) => p.status === "approved").length;

  async function addToCalendar() {
    setScheduling(true);
    try {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(10, 0, 0, 0);
      const n = await autoSchedule({ packId, startAt: start.getTime() });
      if (n === 0) {
        toast("Approve at least one post first");
      } else {
        toast.success(`${n} post${n === 1 ? "" : "s"} added to your calendar`, {
          action: { label: "View", onClick: () => router.push("/calendar") },
        });
      }
    } catch (e) {
      toast.error("Couldn't schedule", { description: getErrorMessage(e) });
    } finally {
      setScheduling(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        className="inline-flex items-center gap-1.5 text-black/50 text-sm hover:text-black"
        href="/brief/new"
      >
        <ArrowLeft className="size-4" />
        New brief
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-semibold text-4xl tracking-tight">
            Your content pack
          </h1>
          <p className="text-black/50 text-sm">
            {generating
              ? `${pack.stage}…`
              : "Review each post. Nothing is scheduled until you approve it."}
          </p>
        </div>
        <Button
          className="rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
          disabled={approved === 0 || scheduling}
          onClick={() => void addToCalendar()}
        >
          {scheduling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CalendarPlus className="size-4" />
          )}
          Add {approved || ""} approved to calendar
        </Button>
      </header>

      {pack.status === "failed" && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {pack.error ?? "Generation failed."}
        </div>
      )}

      <TrendsPanel
        hashtags={pack.trendHashtags}
        loading={generating}
        topics={pack.trendTopics}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard generating={generating} key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}