export interface BackloggdGame {
  title: string;
  company?: string;
  stars?: string;
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

function formatRating(raw: string | undefined): string {
  if (!raw) return "";
  const n = parseFloat(raw);
  if (isNaN(n)) return "";
  // data-rating is 0–10; convert to 0–5 stars
  const stars = n / 2;
  return "★".repeat(Math.floor(stars)) + (stars % 1 >= 0.5 ? "½" : "");
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function getBackloggdGames(username = "3p5ilon"): Promise<BackloggdGame | null> {
  try {
    const urls = [
      `https://backloggd.com/u/${username}/playing`,
      `https://backloggd.com/u/${username}/games?type=playing`,
      `https://backloggd.com/u/${username}/games`,
    ];

    for (const url of urls) {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      if (html.includes("Anubis") || html.includes("Making sure")) continue;

      const m =
        html.match(/data-rating="(\d+)"[\s\S]*?href="(\/games\/(?!lib)[^"]+)"[\s\S]*?src="([^"]+)"[^>]*alt="([^"]+)"/i) ||
        html.match(/href="(\/games\/(?!lib)[^"]+)"[\s\S]*?src="([^"]+)"[^>]*alt="([^"]+)"/i);

      if (m) {
        const hasRating = m.length === 5;
        const rawRating = hasRating ? m[1] : undefined;
        const slug = hasRating ? m[2] : m[1];
        const rawImage = hasRating ? m[3] : m[2];
        const rawTitle = hasRating ? m[4] : m[3];

        const title = decodeEntities(rawTitle).trim();
        const image = rawImage.startsWith("//") ? `https:${rawImage}` : rawImage;
        const stars = formatRating(rawRating) || undefined;
        const link = `https://backloggd.com/u/${username}/playing`;

        let company: string | undefined;
        try {
          const gameRes = await fetch(`https://backloggd.com${slug}`, {
            headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
            signal: AbortSignal.timeout(3500),
          });
          if (gameRes.ok) {
            const gameHtml = await gameRes.text();
            const compMatch =
              gameHtml.match(/development company ([^<\.,]+)/i) ||
              gameHtml.match(/href="\/company\/(?:[^"]+)"[^>]*>([^<]+)<\/a>/i);
            if (compMatch) company = decodeEntities(compMatch[1]).trim();
          }
        } catch {}

        return { title, company, stars, image, link };
      }
    }
  } catch (err) {
    console.error("[now/backloggd] fetch failed:", err);
  }

  return null;
}
