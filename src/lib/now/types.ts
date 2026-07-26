export interface GoodreadsBook {
  title: string;
  author?: string;
  image?: string;
  link: string;
}

export interface LetterboxdMovie {
  title: string;
  year?: string;
  stars?: string;
  image?: string;
  link: string;
}

export interface LastfmTrack {
  title: string;
  artist: string;
  image?: string;
  link: string;
}

export interface NowFeedsData {
  book: GoodreadsBook;
  movie: LetterboxdMovie;
  track: LastfmTrack;
}
