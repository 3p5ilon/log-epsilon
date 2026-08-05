import { getBook, type Book } from "./books";
import { getFilm, type Film } from "./films";
import { getShow, type Show } from "./shows";
import { getMusic, type Music } from "./music";
import { getGame, type Game } from "./games";

export interface NowFeedsData {
  books: Book | null;
  films: Film | null;
  shows: Show | null;
  music: Music | null;
  games: Game | null;
  updatedAt: string;
}

export async function getNowFeeds(): Promise<NowFeedsData> {
  const [booksRes, filmsRes, showsRes, musicRes, gamesRes] = await Promise.allSettled([
    getBook(),
    getFilm(),
    getShow(),
    getMusic(),
    getGame(),
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
