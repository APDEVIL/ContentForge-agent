import { InferenceClient } from "@huggingface/inference";

type Size = { width: number; height: number };
const HF_MODEL = "black-forest-labs/FLUX.1-schnell";

async function viaHuggingFace(prompt: string, size: Size): Promise<Blob> {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("HF_TOKEN is not set in Convex env");
  const client = new InferenceClient(token);
  const image: unknown = await client.textToImage({
    provider: "auto",
    model: HF_MODEL,
    inputs: prompt,
    parameters: {
      width: size.width,
      height: size.height,
      num_inference_steps: 4,
    },
  });

  if (image instanceof Blob) return image;
  if (typeof image === "string") {
    // URL or data: URL returned instead of a Blob
    const res = await fetch(image);
    if (!res.ok) throw new Error(`Could not download HF image: ${res.status}`);
    return await res.blob();
  }
  throw new Error("Unexpected response from Hugging Face image API");
}

// Keyless fallback used when HF free credits run out. Best-effort.
async function viaPollinations(prompt: string, size: Size): Promise<Blob> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 800))}?width=${size.width}&height=${size.height}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1_000_000)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`Pollinations failed: ${res.status}`);
  return await res.blob();
}

export async function generateImage(prompt: string, size: Size): Promise<Blob> {
  if (process.env.SKIP_IMAGES === "true") throw new Error("Images skipped (SKIP_IMAGES=true)");
  try {
    return await viaHuggingFace(prompt, size);
  } catch (e) {
    console.warn(
      "HF image failed, falling back to Pollinations:",
      e instanceof Error ? e.message : e,
    );
    return await viaPollinations(prompt, size);
  }
}
