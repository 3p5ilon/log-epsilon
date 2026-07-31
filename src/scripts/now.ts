async function updateFeeds() {
  if (document.hidden) return;
  try {
    const res = await fetch("/api/now.json");
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    // 1. Books
    if (data.books) {
      const img = document.getElementById("books-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("books-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("books-title") as HTMLAnchorElement | null;
      const sub = document.getElementById("books-subtitle");
      if (img && data.books.image && img.src !== data.books.image) img.src = data.books.image;
      if (imgLink && data.books.link) imgLink.href = data.books.link;
      if (title) {
        if (data.books.link && title.href !== data.books.link) title.href = data.books.link;
        if (data.books.title && title.textContent !== data.books.title) title.textContent = data.books.title;
      }
      if (sub && data.books.author && sub.textContent !== data.books.author) {
        sub.textContent = data.books.author;
      }
    }

    // 2. Films
    if (data.films) {
      const img = document.getElementById("films-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("films-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("films-title") as HTMLAnchorElement | null;
      const year = document.getElementById("films-year");
      const director = document.getElementById("films-director");
      const stars = document.getElementById("films-stars");
      if (img && data.films.image && img.src !== data.films.image) img.src = data.films.image;
      if (imgLink && data.films.link) imgLink.href = data.films.link;
      if (title) {
        if (data.films.link && title.href !== data.films.link) title.href = data.films.link;
        const titleSpan = title.querySelector("span:first-child");
        if (titleSpan && data.films.title && titleSpan.textContent !== data.films.title) {
          titleSpan.textContent = data.films.title;
        }
      }
      if (year && data.films.year) {
        const yearText = "(" + data.films.year + ")";
        if (year.textContent !== yearText) year.textContent = yearText;
      }
      if (director && data.films.director) {
        if (director.textContent !== data.films.director) director.textContent = data.films.director;
      }
      if (stars && data.films.stars && stars.textContent !== data.films.stars) {
        stars.textContent = data.films.stars;
      }
    }

    // 3. Shows
    if (data.shows) {
      const img = document.getElementById("shows-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("shows-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("shows-title") as HTMLAnchorElement | null;
      const director = document.getElementById("shows-director");
      const sub = document.getElementById("shows-subtitle");
      if (img && data.shows.image && img.src !== data.shows.image) img.src = data.shows.image;
      if (imgLink && data.shows.link) imgLink.href = data.shows.link;
      if (title) {
        if (data.shows.link && title.href !== data.shows.link) title.href = data.shows.link;
        if (data.shows.title && title.textContent !== data.shows.title) title.textContent = data.shows.title;
      }
      if (director && data.shows.director) {
        if (director.textContent !== data.shows.director) director.textContent = data.shows.director;
      }
      if (sub && data.shows.subtitle && sub.textContent !== data.shows.subtitle) {
        sub.textContent = data.shows.subtitle;
      }
    }

    // 4. Music
    if (data.music) {
      const img = document.getElementById("music-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("music-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("music-title") as HTMLAnchorElement | null;
      const sub = document.getElementById("music-subtitle");
      if (img && data.music.image && img.src !== data.music.image) img.src = data.music.image;
      if (imgLink && data.music.link) imgLink.href = data.music.link;
      if (title) {
        if (data.music.link && title.href !== data.music.link) title.href = data.music.link;
        if (data.music.title && title.textContent !== data.music.title) title.textContent = data.music.title;
      }
      if (sub && data.music.artist && sub.textContent !== data.music.artist) {
        sub.textContent = data.music.artist;
      }
    }

    // 5. Games
    if (data.games) {
      const img = document.getElementById("games-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("games-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("games-title") as HTMLAnchorElement | null;
      const company = document.getElementById("games-company");
      const stars = document.getElementById("games-stars");
      const sub = document.getElementById("games-subtitle");
      if (img && data.games.image && img.src !== data.games.image) img.src = data.games.image;
      if (imgLink && data.games.link) imgLink.href = data.games.link;
      if (title) {
        if (data.games.link && title.href !== data.games.link) title.href = data.games.link;
        if (data.games.title && title.textContent !== data.games.title) title.textContent = data.games.title;
      }
      if (company && data.games.company && company.textContent !== data.games.company) {
        company.textContent = data.games.company;
      }
      if (stars && data.games.stars && stars.textContent !== data.games.stars) {
        stars.textContent = data.games.stars;
      }
      if (sub && data.games.subtitle && sub.textContent !== data.games.subtitle) {
        sub.textContent = data.games.subtitle;
      }
    }
  } catch (e) {}
}

// Fetch immediately on page load
updateFeeds();

// Poll every 60 seconds
setInterval(updateFeeds, 60000);

// Fetch when returning to tab
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateFeeds();
});
