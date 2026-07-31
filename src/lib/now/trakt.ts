export interface TraktShow {
  title: string;
  director?: string;
  subtitle?: string;
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

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function getTraktShows(username = "3p5ilon"): Promise<TraktShow | null> {
  const pages = [
    `https://trakt.tv/users/${username}/history`,
    `https://trakt.tv/users/${username}`,
  ];

  for (const pageUrl of pages) {
    try {
      const res = await fetch(pageUrl, {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) continue;

      const html = await res.text();

      // Scrape show link, title, and cover image from HTML page if server-rendered
      const showMatch =
        html.match(/href="(\/shows\/(?!popular|trending|watched)[^"]+)"[^>]*>([^<]+)<\/a>/i) ||
        html.match(/<a[^>]+href="(\/shows\/([^"]+))"[^>]*>([\s\S]*?)<\/a>/i);

      if (showMatch) {
        const slug = showMatch[1].replace(/^\/shows\//, "").replace(/\/$/, "");
        const rawTitle = showMatch[2] || showMatch[3] || slug;
        const title = decodeEntities(rawTitle.replace(/<[^>]+>/g, "")).trim();

        // Extract image if available
        const imgMatch = html.match(/src="([^"]*(?:walter-r2|media\.trakt\.tv|fanart|posters)[^"]*)"/i);
        const image = imgMatch ? imgMatch[1] : undefined;

        if (title) {
          return {
            title,
            image,
            link: `https://trakt.tv/shows/${slug}`,
          };
        }
      }
    } catch (err) {
      console.error(`[now/trakt-html] Scraping failed for ${pageUrl}:`, err);
    }
  }

  return null;
}
