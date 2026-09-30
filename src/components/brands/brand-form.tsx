"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Plus } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";

const INDUSTRIES = [
  "Fashion & Apparel",
  "B2B SaaS",
  "Food & Beverage",
  "Health & Fitness",
  "Education",
  "Travel",
  "Real Estate",
  "Finance",
];

const MAX_LOGO_BYTES = 4 * 1024 * 1024;

type Props = { onCreated?: (brandId: Id<"brands">) => void };

export function BrandForm({ onCreated }: Props) {
  const create = useMutation(api.brands.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!logo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  const canSubmit =
    !saving && name.trim().length > 0 && industry.trim().length > 0;

  function pickLogo(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Logo must be under 4 MB");
      return;
    }
    setLogo(file);
  }

  async function uploadLogo(file: File): Promise<Id<"_storage">> {
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
      method: "POST",
    });
    if (!res.ok) throw new Error("Logo upload failed");
    const json = (await res.json()) as { storageId: Id<"_storage"> };
    return json.storageId;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const logoStorageId = logo ? await uploadLogo(logo) : undefined;
      const brandId = await create({
        description: description.trim() || undefined,
        industry,
        logoStorageId,
        name,
      });
      toast.success(`${name.trim()} added`);
      setName("");
      setIndustry("");
      setDescription("");
      setLogo(null);
      if (fileRef.current) fileRef.current.value = "";
      onCreated?.(brandId);
    } catch (err) {
      toast.error("Couldn't add the brand", {
        description: getErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="space-y-5 rounded-[2rem] border border-black/5 bg-white/85 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur"
      onSubmit={submit}
    >
      <div>
        <h2 className="font-semibold text-lg">Add a brand</h2>
        <p className="text-black/50 text-sm">
          You'll add its past posts on the next screen.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-name">Brand name</Label>
        <Input
          className="rounded-full"
          id="brand-name"
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Threadly"
          value={name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-industry">Industry</Label>
        <Input
          className="rounded-full"
          id="brand-industry"
          maxLength={60}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Type one, or pick below"
          value={industry}
        />
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((item) => (
            <button
              aria-pressed={industry === item}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                industry === item
                  ? "bg-[#d4ff3f] font-semibold text-black"
                  : "bg-black/5 text-black/60 hover:bg-lime-100",
              )}
              key={item}
              onClick={() => setIndustry(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-about">About the brand (optional)</Label>
        <Textarea
          className="rounded-2xl"
          id="brand-about"
          maxLength={300}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Who is it for? What makes it different?"
          rows={3}
          value={description}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand-logo">Logo (optional)</Label>
        <input
          accept="image/*"
          className="sr-only"
          id="brand-logo"
          onChange={(e) => pickLogo(e.target.files?.[0])}
          ref={fileRef}
          type="file"
        />
        <label
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 border-dashed p-3 transition-colors hover:bg-lime-50 has-[:focus-visible]:ring-2"
          htmlFor="brand-logo"
        >
          <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-black/5">
            {preview ? (
              <img
                alt="Logo preview"
                className="size-full object-cover"
                src={preview}
              />
            ) : (
              <ImagePlus className="size-5 text-black/40" />
            )}
          </span>
          <span className="text-black/60 text-sm">
            {logo ? logo.name : "Upload an image (max 4 MB)"}
          </span>
        </label>
      </div>

      <Button
        className="h-11 w-full rounded-full bg-[#d4ff3f] font-semibold text-black hover:bg-[#c8f22d]"
        disabled={!canSubmit}
        type="submit"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Add brand
      </Button>
    </form>
  );
}