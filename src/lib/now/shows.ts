export interface SerializdShow {
  title: string;
  director?: string;
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

function formatRating(raw: number | undefined): string {
  if (raw === undefined || raw === null || isNaN(raw)) return "";
  const starsNum = raw / 2;
  return "★".repeat(Math.floor(starsNum)) + (starsNum % 1 >= 0.5 ? "½" : "");
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function getSerializdShows(username = "3p5ilon"): Promise<SerializdShow | null> {
  const timestamp = Date.now();

  // Layer 1: Serializd Profile Recent Reviews API
  try {
    const profileUrl = `https://serializd.onrender.com/mobile/page/profile_v2_part_2/${username}?_t=${timestamp}`;
    const res = await fetch(profileUrl, {
      cache: "no-store",
      headers: {
        "X-Requested-With": "serializd_vercel",
        "User-Agent": UA,
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const recentReviews = data?.recentReviews;
      if (Array.isArray(recentReviews) && recentReviews.length > 0) {
        const latest = recentReviews[0];
        const rawTitle = latest.showName;

        if (rawTitle) {
          const title = decodeEntities(String(rawTitle)).trim();
          const stars = formatRating(latest.rating) || undefined;
          const reviewId = latest.id;
          const link = reviewId
            ? `https://www.serializd.com/review/${reviewId}`
            : `https://www.serializd.com/user/${username}`;

          const imagePath = latest.showSeasons?.[0]?.posterPath || latest.showBannerImage;
          const image = imagePath
            ? imagePath.startsWith("http")
              ? imagePath
              : `https://image.tmdb.org/t/p/w500${imagePath}`
            : undefined;

          // Fetch Director from Show Details API
          let director: string | undefined;
          if (latest.showId) {
            try {
              const showUrl = `https://serializd.onrender.com/mobile/page/show_v2_part_2/${latest.showId}?_t=${timestamp}`;
              const showRes = await fetch(showUrl, {
                cache: "no-store",
                headers: {
                  "X-Requested-With": "serializd_vercel",
                  "User-Agent": UA,
                  Accept: "application/json",
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                },
                signal: AbortSignal.timeout(3500),
              });

              if (showRes.ok) {
                const showData = await showRes.json();
                const crew = showData.crew || [];
                const dirObj =
                  crew.find((c: any) => c.jobs?.some((j: any) => j.job === "Director")) ||
                  crew.find((c: any) => c.jobs?.some((j: any) => j.job === "Creator" || j.job === "Executive Producer"));
                if (dirObj) director = decodeEntities(dirObj.name).trim();
              }
            } catch {}
          }

          return {
            title,
            director,
            stars,
            image,
            link,
          };
        }
      }
    }
  } catch (err) {
    console.error("[now/shows] Serializd reviews fetch failed:", err);
  }

  // Layer 2: Serializd User Stats API Fallback
  try {
    const apiUrl = `https://serializd.onrender.com/mobile/page/user_stats/${username}?_t=${timestamp}`;
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "X-Requested-With": "serializd_vercel",
        "User-Agent": UA,
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const timePerShow = data?.watchedStats?.timePerShow;
      if (Array.isArray(timePerShow) && timePerShow.length > 0) {
        const top = timePerShow[0];
        const details = top?.showDetails;
        const rawTitle = details?.name;

        if (rawTitle) {
          const title = decodeEntities(String(rawTitle)).trim();
          const backdrops = top?.showImages?.backdrops || [];
          const posters = top?.showImages?.posters || [];
          const imagePath = backdrops[0]?.imageUrl || posters[0]?.imageUrl || details?.bannerImage;
          const image = imagePath
            ? imagePath.startsWith("http")
              ? imagePath
              : `https://image.tmdb.org/t/p/w500${imagePath}`
            : undefined;

          const showId = details?.id;
          const link = showId
            ? `https://www.serializd.com/show/${showId}`
            : `https://www.serializd.com/user/${username}`;

          return {
            title,
            image,
            link,
          };
        }
      }
    }
  } catch (err) {
    console.error("[now/shows] User stats fallback failed:", err);
  }

  return null;
}
