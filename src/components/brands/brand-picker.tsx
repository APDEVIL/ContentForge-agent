"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import Link from "next/link";
import { Skeleton } from "~/components/ui/skeleton";

type Props = {
  onChange: (id: Id<"brands">) => void;
  value: Id<"brands"> | null;
};

const SKELETON = ["b1", "b2", "b3"];

export function BrandPicker({ onChange, value }: Props) {
  const brands = useQuery(api.brands.list);

  if (brands === undefined) {
    return (
      <div className="flex gap-2">
        {SKELETON.map((id) => (
          <Skeleton className="h-14 w-40 rounded-2xl" key={id} />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-800 text-sm">
        You need a brand before you can create content.{" "}
        <Link className="font-semibold underline" href="/brands">
          Add a brand
        </Link>
      </p>
    );
  }

  return (
    <fieldset className="flex flex-wrap gap-2 border-0 p-0">
      <legend className="sr-only">Choose a brand</legend>
      {brands.map((brand) => (
        <label
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white/70 px-3 py-2.5 transition-all hover:-translate-y-0.5 has-[:checked]:border-black has-[:checked]:bg-[#d4ff3f] has-[:focus-visible]:ring-2"
          key={brand._id}
        >
          <input
            checked={value === brand._id}
            className="sr-only"
            name="brand"
            onChange={() => onChange(brand._id)}
            type="radio"
            value={brand._id}
          />
          <span className="flex size-8 items-center justify-center rounded-full bg-white font-semibold text-sm">
            {brand.name.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm">
            <span className="block font-semibold">{brand.name}</span>
            <span className="block text-black/50 text-xs">{brand.industry}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}