import { decodeEntities, jsonFetchInit, htmlFetchInit } from "./utils";

export interface Music {
  title: string;
  artist: string;
  image?: string;
  link: string;
}

export type LastfmMusic = Music;

const LASTFM_USERNAME = "log3p5ilon";

export async function getMusic(): Promise<Music | null> {
  const apiKey = (import.meta.env?.LASTFM_API_KEY ?? process.env?.LASTFM_API_KEY ?? "").trim();
  const ts = Date.now();

  // Last.fm API
  if (apiKey) {
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${apiKey}&format=json&limit=1&_t=${ts}`;
      const res = await fetch(url, jsonFetchInit());
      if (res.ok) {
        const data = await res.json();
        const raw = data?.recenttracks?.track?.[0];
        if (raw) {
          const title = decodeEntities(String(raw.name || "")).trim();
          const artist = decodeEntities(String(raw.artist?.["#text"] ?? raw.artist?.name ?? "")).trim();
          const link = String(raw.url || `https://www.last.fm/user/${LASTFM_USERNAME}`).trim();
          const images: { size: string; "#text": string }[] = raw.image ?? [];
          const img =
            images.find((i) => i.size === "extralarge") ??
            images.find((i) => i.size === "large") ??
            images.at(-1);
          const image = img?.["#text"]?.replace(/\/(34s|64s|174s)\//, "/300x300/") || undefined;

          if (title && artist) return { title, artist, image, link };
        }
      }
    } catch (err) {
      console.error("[now/music] API request failed:", err);
    }
  }

  // HTML fallback
  try {
    const res = await fetch(`https://www.last.fm/user/${LASTFM_USERNAME}?_t=${ts}`, htmlFetchInit());
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
          image: imgSrc?.replace(/\/(34s|64s|174s)\//, "/300x300/"),
          link: trackLink ? `https://www.last.fm${trackLink}` : `https://www.last.fm/user/${LASTFM_USERNAME}`,
        };
      }
    }
  } catch (err) {
    console.error("[now/music] HTML fallback failed:", err);
  }

  return null;
}

export const getLastfmListening = getMusic;
