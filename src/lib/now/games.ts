import { decodeEntities, htmlFetchInit, starsFromTen } from "./utils";

export interface Game {
  title: string;
  company?: string;
  stars?: string;
  subtitle?: string;
  image?: string;
  link: string;
}

export type BackloggdGame = Game;

const BACKLOGGD_USERNAME = "3p5ilon";

export async function getGame(): Promise<Game | null> {
  const ts = Date.now();

  // Try URLs from most specific (playing shelf) to general
  const candidates = [
    `https://backloggd.com/u/${BACKLOGGD_USERNAME}/games/added/type:playing/?_t=${ts}`,
    `https://backloggd.com/u/${BACKLOGGD_USERNAME}/playing?_t=${ts}`,
    `https://backloggd.com/u/${BACKLOGGD_USERNAME}/games?type=playing&_t=${ts}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, htmlFetchInit());
      if (!res.ok) continue;

      const html = await res.text();
      // Skip challenge / bot-detection pages
      if (html.includes("Anubis") || html.includes("Making sure")) continue;

      const withRating =
        html.match(/data-rating="(\d+)"[\s\S]*?href="(\/games\/(?!lib)[^"]+)"[\s\S]*?src="([^"]+)"[^>]*alt="([^"]+)"/i);
      const withoutRating =
        html.match(/href="(\/games\/(?!lib)[^"]+)"[\s\S]*?src="([^"]+)"[^>]*alt="([^"]+)"/i);

      const m = withRating ?? withoutRating;
      if (!m) continue;

      const hasRating = m === withRating;
      const rawRating = hasRating ? m[1] : undefined;
      const slug = hasRating ? m[2] : m[1];
      const rawImage = hasRating ? m[3] : m[2];
      const rawTitle = hasRating ? m[4] : m[3];

      const title = decodeEntities(rawTitle).trim();
      if (!title) continue;

      const image = rawImage.startsWith("//") ? `https:${rawImage}` : rawImage;
      const stars = starsFromTen(rawRating);
      const link = `https://backloggd.com/u/${BACKLOGGD_USERNAME}/games/added/type:playing/`;

      // Fetch company from game page
      let company: string | undefined;
      try {
        const gameRes = await fetch(`https://backloggd.com${slug}?_t=${ts}`, htmlFetchInit(4000));
        if (gameRes.ok) {
          const gameHtml = await gameRes.text();
          const m =
            gameHtml.match(/development company ([^<.,]+)/i) ||
            gameHtml.match(/href="\/company\/[^"]*"[^>]*>([^<]+)<\/a>/i);
          if (m) company = decodeEntities(m[1]).trim();
        }
      } catch {}

      return { title, company, stars, image, link };
    } catch (err) {
      console.error("[now/games] fetch error for url:", url, err);
    }
  }

  return null;
}

export const getBackloggdGames = getGame;
