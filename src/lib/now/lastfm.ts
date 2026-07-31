export interface LastfmMusic {
  title: string;
  artist: string;
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

export async function getLastfmListening(username = "log3p5ilon"): Promise<LastfmMusic | null> {
  const apiKey = (import.meta.env?.LASTFM_API_KEY || process.env?.LASTFM_API_KEY || "").trim();

  if (apiKey) {
    try {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        const raw = data?.recenttracks?.track?.[0];
        if (raw) {
          const title = decodeEntities(String(raw.name || "")).trim();
          const artist = decodeEntities(String(raw.artist?.["#text"] || raw.artist?.name || "")).trim();
          const link = String(raw.url || `https://www.last.fm/user/${username}`).trim();
          const images: { size: string; "#text": string }[] = raw.image ?? [];
          const img =
            images.find((i) => i.size === "extralarge") ||
            images.find((i) => i.size === "large") ||
            images.at(-1);
          
          let image = img?.["#text"] || undefined;
          if (image) {
            image = image.replace(/\/(34s|64s|174s)\//, "/300x300/");
          }

          if (title && artist) {
            return { title, artist, image, link };
          }
        }
      }
    } catch (err) {
      console.error("[now/lastfm-api] Official API request failed:", err);
    }
  }

  try {
    const res = await fetch(`https://www.last.fm/user/${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(4000),
    });
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
          link: trackLink ? `https://www.last.fm${trackLink}` : `https://www.last.fm/user/${username}`,
        };
      }
    }
  } catch (err) {
    console.error("[now/lastfm-html] HTML fallback failed:", err);
  }

  return null;
}
