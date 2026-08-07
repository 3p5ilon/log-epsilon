import { XMLParser } from "fast-xml-parser";
import { decodeEntities, htmlFetchInit } from "./utils";

export interface Book {
  title: string;
  author?: string;
  image?: string;
  link: string;
}

export type GoodreadsBook = Book;

const GOODREADS_USER_ID = "128272854";

export async function getBook(): Promise<Book | null> {
  try {
    const ts = Date.now();
    const url = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=currently-reading&_t=${ts}`;
    const res = await fetch(url, htmlFetchInit());
    if (!res.ok) return null;

    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(await res.text());
    const rawItems = parsed?.rss?.channel?.item;
    const items = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];
    if (items.length === 0) return null;

    const item = items[0];
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
      link: link || `https://www.goodreads.com/user/show/${GOODREADS_USER_ID}`,
    };
  } catch (err) {
    console.error("[now/books] Failed to fetch Goodreads feed:", err);
    return null;
  }
}

export const getGoodreadsReading = getBook;
