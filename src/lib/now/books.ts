import { XMLParser } from "fast-xml-parser";

export interface GoodreadsBook {
  title: string;
  author?: string;
  image?: string;
  link: string;
}

function decodeEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function getGoodreadsReading(userId = "128272854"): Promise<GoodreadsBook | null> {
  try {
    const timestamp = Date.now();
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=currently-reading&_t=${timestamp}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(await res.text());
    const rawItems = parsed?.rss?.channel?.item;
    const item = rawItems ? (Array.isArray(rawItems) ? rawItems[0] : rawItems) : null;
    if (!item) return null;

    const cdata = (v: unknown) => (v && typeof v === "object" ? (v as any).__cdata || "" : String(v ?? ""));
    const title = decodeEntities(cdata(item.title)).trim();
    if (!title) return null;

    const author = decodeEntities(cdata(item.author_name)).trim();
    const link = decodeEntities(cdata(item.link)).trim();
    let image = cdata(item.book_image_url).trim();
    if (image) image = image.replace(/_SY\d+_\./, "_SX300_.").replace(/_SX\d+_\./, "_SX300_.");

    return {
      title,
      author: author || undefined,
      image: image || undefined,
      link: link || `https://www.goodreads.com/user/show/${userId}`,
    };
  } catch (err) {
    console.error("[now/books] Failed to fetch Goodreads feed:", err);
    return null;
  }
}
