import { decodeEntities, jsonFetchInit, tmdbImage, starsFromTen } from "./utils";

export interface Show {
  title: string;
  director?: string;
  stars?: string;
  subtitle?: string;
  image?: string;
  link: string;
}

export type SerializdShow = Show;

const SERIALIZD_USERNAME = "3p5ilon";
const SERIALIZD_HEADERS = { "X-Requested-With": "serializd_vercel" };

export async function getShow(): Promise<Show | null> {
  const ts = Date.now();

  // Recent review from profile
  try {
    const res = await fetch(
      `https://serializd.onrender.com/mobile/page/profile_v2_part_2/${SERIALIZD_USERNAME}?_t=${ts}`,
      jsonFetchInit(SERIALIZD_HEADERS)
    );

    if (res.ok) {
      const data = await res.json();
      const latest = (data?.recentReviews as any[])?.[0];
      if (latest?.showName) {
        const title = decodeEntities(String(latest.showName)).trim();
        const stars = starsFromTen(latest.rating);
        const link = latest.id
          ? `https://www.serializd.com/review/${latest.id}`
          : `https://www.serializd.com/user/${SERIALIZD_USERNAME}`;
        const image = tmdbImage(latest.showSeasons?.[0]?.posterPath ?? latest.showBannerImage);

        // Fetch director from crew details
        let director: string | undefined;
        if (latest.showId) {
          try {
            const crewRes = await fetch(
              `https://serializd.onrender.com/mobile/page/show_v2_part_2/${latest.showId}?_t=${ts}`,
              jsonFetchInit(SERIALIZD_HEADERS, 3500)
            );
            if (crewRes.ok) {
              const crewData = await crewRes.json();
              const crew = (crewData?.crew as any[]) ?? [];
              const match =
                crew.find((c) => c.jobs?.some((j: any) => j.job === "Director")) ??
                crew.find((c) => c.jobs?.some((j: any) => j.job === "Creator" || j.job === "Executive Producer"));
              if (match) director = decodeEntities(match.name).trim();
            }
          } catch {}
        }

        return { title, director, stars, image, link };
      }
    }
  } catch (err) {
    console.error("[now/shows] profile_v2_part_2 fetch failed:", err);
  }

  // Fallback: top show from user_stats
  try {
    const res = await fetch(
      `https://serializd.onrender.com/mobile/page/user_stats/${SERIALIZD_USERNAME}?_t=${ts}`,
      jsonFetchInit(SERIALIZD_HEADERS, 4000)
    );

    if (res.ok) {
      const data = await res.json();
      const top = (data?.watchedStats?.timePerShow as any[])?.[0];
      if (top?.showDetails?.name) {
        const details = top.showDetails;
        const title = decodeEntities(String(details.name)).trim();
        const backdrops: any[] = top?.showImages?.backdrops ?? [];
        const posters: any[] = top?.showImages?.posters ?? [];
        const image = tmdbImage(backdrops[0]?.imageUrl ?? posters[0]?.imageUrl ?? details.bannerImage);
        const link = details.id
          ? `https://www.serializd.com/show/${details.id}`
          : `https://www.serializd.com/user/${SERIALIZD_USERNAME}`;
        return { title, image, link };
      }
    }
  } catch (err) {
    console.error("[now/shows] user_stats fallback failed:", err);
  }

  return null;
}

export const getSerializdShows = getShow;
