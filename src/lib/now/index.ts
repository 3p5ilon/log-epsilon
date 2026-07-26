import type { NowFeedsData } from "./types";
import { getGoodreadsReading } from "./goodreads";
import { getLetterboxdWatching } from "./letterboxd";
import { getLastfmListening } from "./lastfm";

export type { NowFeedsData } from "./types";

export async function getNowFeeds(): Promise<NowFeedsData> {
  const [book, movie, track] = await Promise.allSettled([
    getGoodreadsReading(),
    getLetterboxdWatching(),
    getLastfmListening(),
  ]);

  if (book.status !== "fulfilled" || movie.status !== "fulfilled" || track.status !== "fulfilled") {
    throw new Error("Unexpected rejection from a fetcher that never rejects");
  }

  return { book: book.value, movie: movie.value, track: track.value };
}
