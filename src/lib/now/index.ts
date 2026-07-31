import { getGoodreadsReading, type GoodreadsBook } from "./goodreads";
import { getLetterboxdWatching, type LetterboxdFilm } from "./letterboxd";
import { getTraktShows, type TraktShow } from "./trakt";
import { getLastfmListening, type LastfmMusic } from "./lastfm";
import { getBackloggdGames, type BackloggdGame } from "./backloggd";

export type { GoodreadsBook, LetterboxdFilm, TraktShow, LastfmMusic, BackloggdGame };

export interface NowFeedsData {
  books: GoodreadsBook | null;
  films: LetterboxdFilm | null;
  shows: TraktShow | null;
  music: LastfmMusic | null;
  games: BackloggdGame | null;
}

export async function getNowFeeds(): Promise<NowFeedsData> {
  const [books, films, shows, music, games] = await Promise.allSettled([
    getGoodreadsReading(),
    getLetterboxdWatching(),
    getTraktShows(),
    getLastfmListening(),
    getBackloggdGames(),
  ]);

  return {
    books: books.status === "fulfilled" ? books.value : null,
    films: films.status === "fulfilled" ? films.value : null,
    shows: shows.status === "fulfilled" ? shows.value : null,
    music: music.status === "fulfilled" ? music.value : null,
    games: games.status === "fulfilled" ? games.value : null,
  };
}
