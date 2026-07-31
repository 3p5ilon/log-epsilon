import { XMLParser } from "fast-xml-parser";

export interface LetterboxdFilm {
  title: string;
  year?: string;
  director?: string;
  stars?: string;
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

function formatRating(rating?: string | number): string {
  if (rating === undefined || rating === null || rating === "") return "";
  const num = typeof rating === "number" ? rating : parseFloat(rating);
  return isNaN(num) ? "" : "★".repeat(Math.floor(num)) + (num % 1 >= 0.5 ? "½" : "");
}

export async function getLetterboxdWatching(username = "3p5ilon"): Promise<LetterboxdFilm | null> {
  try {
    const res = await fetch(`https://letterboxd.com/${username}/rss/`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
    const parsed = parser.parse(await res.text());
    const rawItems = parsed?.rss?.channel?.item;
    const item = rawItems ? (Array.isArray(rawItems) ? rawItems[0] : rawItems) : null;
    if (!item) return null;

    const title = decodeEntities(String(item.filmTitle || item.title || "")).trim();
    if (!title) return null;

    const year = item.filmYear ? String(item.filmYear) : undefined;
    const stars = formatRating(item.memberRating);
    const link = String(item.link || `https://letterboxd.com/${username}/`).trim();

    let image: string | undefined;
    if (item.description) {
      const imgMatch = String(item.description).match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
    }

    let director: string | undefined;
    if (link && link.includes("/film/")) {
      const baseFilmUrl = link.replace(/letterboxd\.com\/[^\/]+\/film\//, "letterboxd.com/film/");
      try {
        const filmRes = await fetch(baseFilmUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(3000),
        });
        if (filmRes.ok) {
          const filmHtml = await filmRes.text();
          const dirMatch =
            filmHtml.match(/href="\/director\/([^"]+)"[^>]*class="[^"]*contributor[^"]*"[^>]*>([^<]+)<\/a>/i) ||
            filmHtml.match(/<a[^>]+href="\/director\/[^"]+"[^>]*>([^<]+)<\/a>/i);
          if (dirMatch) {
            director = decodeEntities(dirMatch[2] || dirMatch[1]).trim();
          }
        }
      } catch {}
    }

    return {
      title,
      year,
      director,
      stars: stars || undefined,
      image,
      link,
    };
  } catch (err) {
    console.error("[now/letterboxd] Failed to fetch watching feed:", err);
    return null;
  }
}
