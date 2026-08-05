import { XMLParser } from "fast-xml-parser";
import { decodeEntities, htmlFetchInit, starsFromDecimal } from "./utils";

export interface Film {
  title: string;
  year?: string;
  director?: string;
  stars?: string;
  image?: string;
  link: string;
}

export type LetterboxdFilm = Film;

const LETTERBOXD_USERNAME = "3p5ilon";

export async function getFilm(): Promise<Film | null> {
  try {
    const ts = Date.now();
    const res = await fetch(
      `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/?_t=${ts}`,
      htmlFetchInit()
    );
    if (!res.ok) return null;

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
    const parsed = parser.parse(await res.text());
    const rawItems = parsed?.rss?.channel?.item;
    const item = rawItems ? (Array.isArray(rawItems) ? rawItems[0] : rawItems) : null;
    if (!item) return null;

    const title = decodeEntities(String(item.filmTitle || item.title || "")).trim();
    if (!title) return null;

    const year = item.filmYear ? String(item.filmYear) : undefined;
    const stars = starsFromDecimal(item.memberRating);
    const link = String(item.link || `https://letterboxd.com/${LETTERBOXD_USERNAME}/`).trim();

    let image: string | undefined;
    if (item.description) {
      const imgMatch = String(item.description).match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
    }

    // Fetch director from film page
    let director: string | undefined;
    if (link.includes("/film/")) {
      const filmUrl = link.replace(/letterboxd\.com\/[^/]+\/film\//, "letterboxd.com/film/");
      try {
        const filmRes = await fetch(`${filmUrl}?_t=${ts}`, htmlFetchInit(4000));
        if (filmRes.ok) {
          const html = await filmRes.text();
          const m =
            html.match(/href="\/director\/[^"]*"[^>]*class="[^"]*contributor[^"]*"[^>]*>([^<]+)<\/a>/i) ||
            html.match(/<a[^>]+href="\/director\/[^"]+"[^>]*>([^<]+)<\/a>/i);
          if (m) director = decodeEntities(m[1]).trim();
        }
      } catch {}
    }

    return { title, year, director, stars, image, link };
  } catch (err) {
    console.error("[now/films] Failed to fetch Letterboxd feed:", err);
    return null;
  }
}

export const getLetterboxdWatching = getFilm;
