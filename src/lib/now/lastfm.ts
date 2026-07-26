import type { LastfmTrack } from "./types";
import { decodeEntities, fetchTimeout } from "./utils";

const FALLBACK: LastfmTrack = {
  title: "We Don't Talk Anymore (feat. Selena Gomez)",
  artist: "Charlie Puth",
  image: "https://lastfm.freetls.fastly.net/i/u/300x300/29e688c6878b784fd8eb9755641b2b97.jpg",
  link: "https://www.last.fm/music/Charlie+Puth/_/We+Don%27t+Talk+Anymore+(feat.+Selena+Gomez)",
};

const LASTFM_USERNAME = "log3p5ilon";
const LASTFM_API_KEY = import.meta.env?.LASTFM_API_KEY ?? "";

async function fromApi(): Promise<LastfmTrack | null> {
  if (!LASTFM_API_KEY) return null;
  try {
    const res = await fetchTimeout(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.recenttracks?.track?.[0];
    if (!raw) return null;

    const title = decodeEntities(String(raw.name || "")).trim();
    const artist = decodeEntities(String(raw.artist?.["#text"] || raw.artist?.name || "")).trim();
    const link = String(raw.url || `https://www.last.fm/user/${LASTFM_USERNAME}`).trim();
    const images: { size: string; "#text": string }[] = raw.image ?? [];
    const img = images.find((i) => i.size === "extralarge") ?? images.at(-1);
    const image = img?.["#text"]?.replace(/\/64s\//, "/300x300/") || FALLBACK.image;

    return { title, artist, image, link };
  } catch {
    return null;
  }
}

async function fromHtml(): Promise<LastfmTrack | null> {
  try {
    const res = await fetchTimeout(
      `https://www.last.fm/user/${LASTFM_USERNAME}`,
      4000,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } }
    );
    if (!res.ok) return null;
    const html = await res.text();

    const trackLink = html.match(/class="chartlist-name"[\s\S]*?href="(\/music[^"]+)"/)?.[1];
    const title = html.match(/class="chartlist-name"[\s\S]*?title="([^"]+)"/)?.[1];
    const artist = html.match(/class="chartlist-artist"[\s\S]*?title="([^"]+)"/)?.[1];
    const imgSrc = html.match(/class="chartlist-image"[\s\S]*?<img[^>]+src="([^"]+)"/)?.[1];

    if (!title || !artist) return null;

    return {
      title: decodeEntities(title),
      artist: decodeEntities(artist),
      image: imgSrc?.replace(/\/64s\//, "/300x300/") ?? FALLBACK.image,
      link: trackLink ? `https://www.last.fm${trackLink}` : `https://www.last.fm/user/${LASTFM_USERNAME}`,
    };
  } catch {
    return null;
  }
}

export async function getLastfmListening(): Promise<LastfmTrack> {
  return (await fromApi()) ?? (await fromHtml()) ?? FALLBACK;
}
