import { getGoodreadsReading, type GoodreadsBook } from "./books";
import { getLetterboxdWatching, type LetterboxdFilm } from "./films";
import { getSerializdShows, type SerializdShow } from "./shows";
import { getLastfmListening, type LastfmMusic } from "./music";
import { getBackloggdGames, type BackloggdGame } from "./games";

export interface NowFeedsData {
  books: GoodreadsBook | null;
  films: LetterboxdFilm | null;
  shows: SerializdShow | null;
  music: LastfmMusic | null;
  games: BackloggdGame | null;
  updatedAt: string;
}

export async function getNowFeeds(): Promise<NowFeedsData> {
  const [booksRes, filmsRes, showsRes, musicRes, gamesRes] = await Promise.allSettled([
    getGoodreadsReading(),
    getLetterboxdWatching(),
    getSerializdShows(),
    getLastfmListening(),
    getBackloggdGames(),
  ]);

  return {
    books: booksRes.status === "fulfilled" ? booksRes.value : null,
    films: filmsRes.status === "fulfilled" ? filmsRes.value : null,
    shows: showsRes.status === "fulfilled" ? showsRes.value : null,
    music: musicRes.status === "fulfilled" ? musicRes.value : null,
    games: gamesRes.status === "fulfilled" ? gamesRes.value : null,
    updatedAt: new Date().toISOString(),
  };
}
