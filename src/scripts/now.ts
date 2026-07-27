async function updateFeeds() {
  if (document.hidden) return;
  try {
    const res = await fetch("/api/now.json");
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    // 1. Reading (Book)
    if (data.book) {
      const img = document.getElementById("book-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("book-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("book-title") as HTMLAnchorElement | null;
      const sub = document.getElementById("book-subtitle");
      if (img && data.book.image && img.src !== data.book.image) img.src = data.book.image;
      if (imgLink && data.book.link) imgLink.href = data.book.link;
      if (title) {
        if (data.book.link && title.href !== data.book.link) title.href = data.book.link;
        if (data.book.title && title.textContent !== data.book.title) {
          title.textContent = data.book.title;
        }
      }
      if (sub && data.book.author && sub.textContent !== data.book.author) {
        sub.textContent = data.book.author;
      }
    }

    // 2. Watching (Movie)
    if (data.movie) {
      const img = document.getElementById("movie-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("movie-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("movie-title") as HTMLAnchorElement | null;
      const year = document.getElementById("movie-year");
      const stars = document.getElementById("movie-stars");
      if (img && data.movie.image && img.src !== data.movie.image) img.src = data.movie.image;
      if (imgLink && data.movie.link) imgLink.href = data.movie.link;
      if (title) {
        if (data.movie.link && title.href !== data.movie.link) title.href = data.movie.link;
        const titleSpan = title.querySelector("span:first-child");
        if (titleSpan && data.movie.title && titleSpan.textContent !== data.movie.title) {
          titleSpan.textContent = data.movie.title;
        }
      }
      if (year && data.movie.year) {
        const yearText = "(" + data.movie.year + ")";
        if (year.textContent !== yearText) year.textContent = yearText;
      }
      if (stars && data.movie.stars && stars.textContent !== data.movie.stars) {
        stars.textContent = data.movie.stars;
      }
    }

    // 3. Listening (Track)
    if (data.track) {
      const img = document.getElementById("track-img") as HTMLImageElement | null;
      const imgLink = document.getElementById("track-img-link") as HTMLAnchorElement | null;
      const title = document.getElementById("track-title") as HTMLAnchorElement | null;
      const sub = document.getElementById("track-subtitle");
      if (img && data.track.image && img.src !== data.track.image) img.src = data.track.image;
      if (imgLink && data.track.link) imgLink.href = data.track.link;
      if (title) {
        if (data.track.link && title.href !== data.track.link) title.href = data.track.link;
        if (data.track.title && title.textContent !== data.track.title) {
          title.textContent = data.track.title;
        }
      }
      if (sub && data.track.artist && sub.textContent !== data.track.artist) {
        sub.textContent = data.track.artist;
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
