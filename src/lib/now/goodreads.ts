import { XMLParser } from "fast-xml-parser";
import type { GoodreadsBook } from "./types";
import { decodeEntities, fetchTimeout } from "./utils";

const FALLBACK: GoodreadsBook = {
  title: "Kafka on the Shore",
  author: "Haruki Murakami",
  image: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1429638085l/4929._SX300_.jpg",
  link: "https://www.goodreads.com/review/show/5752205699",
};

const GOODREADS_USER_ID = "128272854";

export async function getGoodreadsReading(): Promise<GoodreadsBook> {
  try {
    const res = await fetchTimeout(
      `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=currently-reading`,
      4000,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }
    );
    if (!res.ok) return FALLBACK;

    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(await res.text());
    const rawItems = parsed?.rss?.channel?.item;
    const item = rawItems ? (Array.isArray(rawItems) ? rawItems[0] : rawItems) : null;
    if (!item) return FALLBACK;

    const cdata = (v: unknown) => (v && typeof v === "object" ? (v as any).__cdata || "" : String(v ?? ""));

    const title = decodeEntities(cdata(item.title)).trim();
    const author = decodeEntities(cdata(item.author_name)).trim();
    const link = decodeEntities(cdata(item.link)).trim();
    let image = cdata(item.book_image_url).trim();
    if (image) image = image.replace(/_SY\d+_\./, "_SX300_.").replace(/_SX\d+_\./, "_SX300_.");

    return {
      title: title || FALLBACK.title,
      author: author || FALLBACK.author,
      image: image || FALLBACK.image,
      link: link || FALLBACK.link,
    };
  } catch {
    return FALLBACK;
  }
}
