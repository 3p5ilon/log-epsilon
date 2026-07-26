import { XMLParser } from "fast-xml-parser";
import type { LetterboxdMovie } from "./types";
import { decodeEntities, formatRating, fetchTimeout } from "./utils";

const FALLBACK: LetterboxdMovie = {
  title: "Frankenstein",
  year: "2025",
  stars: "★★★½",
  image: "https://a.ltrbxd.com/resized/film-poster/9/5/8/1/0/0/958100-frankenstein-2025-0-600-0-900-crop.jpg?v=49a1ca2305",
  link: "https://letterboxd.com/3p5ilon/film/frankenstein-2025/",
};

const LETTERBOXD_USERNAME = "3p5ilon";

export async function getLetterboxdWatching(): Promise<LetterboxdMovie> {
  try {
    const res = await fetchTimeout(
      `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`,
      4000,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return FALLBACK;

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
    const parsed = parser.parse(await res.text());
    const rawItems = parsed?.rss?.channel?.item;
    const item = rawItems ? (Array.isArray(rawItems) ? rawItems[0] : rawItems) : null;
    if (!item) return FALLBACK;

    const title = decodeEntities(String(item.filmTitle || item.title || "")).trim();
    const year = item.filmYear ? String(item.filmYear) : undefined;
    const stars = formatRating(item.memberRating);
    const link = String(item.link || `https://letterboxd.com/${LETTERBOXD_USERNAME}/`).trim();

    let image = FALLBACK.image;
    if (item.description) {
      const imgMatch = String(item.description).match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
    }

    return {
      title: title || FALLBACK.title,
      year: year || FALLBACK.year,
      stars: stars || FALLBACK.stars,
      image,
      link,
    };
  } catch {
    return FALLBACK;
  }
}
