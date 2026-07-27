import { XMLParser } from "fast-xml-parser";

export interface GoodreadsBook {
  title: string;
  author?: string;
  image?: string;
  link: string;
}

export interface LetterboxdMovie {
  title: string;
  year?: string;
  stars?: string;
  image?: string;
  link: string;
}

export interface LastfmTrack {
  title: string;
  artist: string;
  image?: string;
  link: string;
}

export interface NowFeedsData {
  book: GoodreadsBook | null;
  movie: LetterboxdMovie | null;
  track: LastfmTrack | null;
}

// Helpers
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

function fetchTimeout(url: string, ms = 4000, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}

// Service Fetchers
export async function getGoodreadsReading(userId = "128272854"): Promise<GoodreadsBook | null> {
  try {
    const res = await fetchTimeout(
      `https://www.goodreads.com/review/list_rss/${userId}?shelf=currently-reading`,
      4000,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }
    );
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
    console.error("[now/goodreads] Failed to fetch reading feed:", err);
    return null;
  }
}

export async function getLetterboxdWatching(username = "3p5ilon"): Promise<LetterboxdMovie | null> {
  try {
    const res = await fetchTimeout(
      `https://letterboxd.com/${username}/rss/`,
      4000,
      { headers: { "User-Agent": "Mozilla/5.0" } }
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
    const stars = formatRating(item.memberRating);
    const link = String(item.link || `https://letterboxd.com/${username}/`).trim();

    let image: string | undefined;
    if (item.description) {
      const imgMatch = String(item.description).match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) image = imgMatch[1];
    }

    return {
      title,
      year,
      stars: stars || undefined,
      image,
      link,
    };
  } catch (err) {
    console.error("[now/letterboxd] Failed to fetch watching feed:", err);
    return null;
  }
}

export async function getLastfmListening(username = "log3p5ilon"): Promise<LastfmTrack | null> {
  const apiKey = (import.meta.env?.LASTFM_API_KEY || process.env?.LASTFM_API_KEY || "").trim();

  if (apiKey) {
    try {
      const res = await fetchTimeout(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`,
        4000
      );
      if (res.ok) {
        const data = await res.json();
        const raw = data?.recenttracks?.track?.[0];
        if (raw) {
          const title = decodeEntities(String(raw.name || "")).trim();
          const artist = decodeEntities(String(raw.artist?.["#text"] || raw.artist?.name || "")).trim();
          const link = String(raw.url || `https://www.last.fm/user/${username}`).trim();
          const images: { size: string; "#text": string }[] = raw.image ?? [];
          const img = images.find((i) => i.size === "extralarge" || i.size === "large") ?? images.at(-1);
          const image = img?.["#text"]?.replace(/\/64s\//, "/300x300/") || undefined;

          if (title && artist) {
            return { title, artist, image, link };
          }
        }
      }
    } catch (err) {
      console.error("[now/lastfm-api] API request failed:", err);
    }
  }

  // HTML scraping fallback
  try {
    const res = await fetchTimeout(
      `https://www.last.fm/user/${username}`,
      4000,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }
    );
    if (res.ok) {
      const html = await res.text();
      const trackLink = html.match(/class="chartlist-name"[\s\S]*?href="(\/music[^"]+)"/)?.[1];
      const title = html.match(/class="chartlist-name"[\s\S]*?title="([^"]+)"/)?.[1];
      const artist = html.match(/class="chartlist-artist"[\s\S]*?title="([^"]+)"/)?.[1];
      const imgSrc = html.match(/class="chartlist-image"[\s\S]*?<img[^>]+src="([^"]+)"/)?.[1];

      if (title && artist) {
        return {
          title: decodeEntities(title),
          artist: decodeEntities(artist),
          image: imgSrc?.replace(/\/64s\//, "/300x300/"),
          link: trackLink ? `https://www.last.fm${trackLink}` : `https://www.last.fm/user/${username}`,
        };
      }
    }
  } catch (err) {
    console.error("[now/lastfm-html] Scraping fallback failed:", err);
  }

  return null;
}

export async function getNowFeeds(): Promise<NowFeedsData> {
  const [bookResult, movieResult, trackResult] = await Promise.allSettled([
    getGoodreadsReading(),
    getLetterboxdWatching(),
    getLastfmListening(),
  ]);

  return {
    book: bookResult.status === "fulfilled" ? bookResult.value : null,
    movie: movieResult.status === "fulfilled" ? movieResult.value : null,
    track: trackResult.status === "fulfilled" ? trackResult.value : null,
  };
}
