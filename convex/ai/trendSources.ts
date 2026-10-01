import { groqJson, MODELS } from "./client";
import { TrendOutputSchema } from "../lib/schemas";

// Change these for a different country (this is India-focused).
const NEWS = { hl: "en-IN", gl: "IN", ceid: "IN:en" };

async function getText(url: string, headers?: Record<string, string>) {
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function googleNews(query: string): Promise<string[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${NEWS.hl}&gl=${NEWS.gl}&ceid=${NEWS.ceid}`;
  const xml = await getText(url);
  if (!xml) return [];
  const titles = [
    ...xml.matchAll(
      /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g,
    ),
  ]
    .map((m) => m[1]?.trim() ?? "")
    .filter(Boolean);
  return titles.slice(1, 11); // first <title> is the feed name
}

async function hackerNews(query: string): Promise<string[]> {
  const txt = await getText(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=8`,
  );
  if (!txt) return [];
  try {
    const json = JSON.parse(txt) as { hits?: { title?: string }[] };
    return (json.hits ?? []).map((h) => h.title ?? "").filter(Boolean);
  } catch {
    return [];
  }
}

async function reddit(query: string): Promise<string[]> {
  // Reddit sometimes blocks server IPs — failure is fine, we just skip it.
  const txt = await getText(
    `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=8`,
    { "User-Agent": "contentforge-hackathon/0.1" },
  );
  if (!txt) return [];
  try {
    const json = JSON.parse(txt) as {
      data?: { children?: { data?: { title?: string } }[] };
    };
    return (json.data?.children ?? [])
      .map((c) => c.data?.title ?? "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchTrends(args: { topic: string; industry: string }) {
  const [news, hn, rd] = await Promise.all([
    googleNews(`${args.topic} ${args.industry}`),
    hackerNews(args.topic),
    reddit(args.topic),
  ]);
  const headlines = [...news, ...hn, ...rd].slice(0, 25);

  const system = `You are a social media trend analyst. From the headlines, pick what is useful for a brand post.
Return JSON: {"topics": ["up to 5 short trending angles relevant to the topic"], "hashtags": ["8-12 hashtags WITHOUT the # symbol, mixing broad and niche"]}
Only use angles genuinely related to the topic and industry. If headlines are empty or irrelevant, return evergreen angles and hashtags for the industry.`;
  const user = `Topic: ${args.topic}\nIndustry: ${args.industry}\nHeadlines:\n${headlines.map((h) => `- ${h}`).join("\n") || "(none available)"}`;

  return await groqJson({
    model: MODELS.fast,
    system,
    user,
    schema: TrendOutputSchema,
    temperature: 0.4,
  });
}