let pollingTimer: ReturnType<typeof setInterval> | null = null;
let isFetching = false;

function updateText(id: string, value?: string) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el && el.textContent !== value) {
    el.textContent = value;
  }
}

function updateHref(id: string, href?: string) {
  if (!href) return;
  const el = document.getElementById(id) as HTMLAnchorElement | null;
  if (el && el.href !== href) {
    el.href = href;
  }
}

function updateImage(id: string, src?: string, alt?: string) {
  if (!src) return;
  const el = document.getElementById(id) as HTMLImageElement | null;
  if (el) {
    if (el.src !== src) el.src = src;
    if (alt && el.alt !== alt) el.alt = alt;
  }
}

async function fetchLiveNowData() {
  if (isFetching || document.hidden) return;
  isFetching = true;

  try {
    const timestamp = Date.now();
    const res = await fetch(`/api/now.json?_t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    // 1. Books
    if (data.books) {
      updateImage("books-img", data.books.image, data.books.title);
      updateHref("books-img-link", data.books.link);
      updateHref("books-title", data.books.link);
      updateText("books-title", data.books.title);
      updateText("books-subtitle", data.books.author);
    }

    // 2. Films
    if (data.films) {
      updateImage("films-img", data.films.image, data.films.title);
      updateHref("films-img-link", data.films.link);
      updateHref("films-title", data.films.link);

      const titleSpan = document.querySelector("#films-title span:first-child");
      if (titleSpan && data.films.title && titleSpan.textContent !== data.films.title) {
        titleSpan.textContent = data.films.title;
      }

      if (data.films.year) updateText("films-year", `(${data.films.year})`);
      updateText("films-director", data.films.director);
      updateText("films-stars", data.films.stars);
    }

    // 3. Shows (Serializd)
    if (data.shows) {
      updateImage("shows-img", data.shows.image, data.shows.title);
      updateHref("shows-img-link", data.shows.link);
      updateHref("shows-title", data.shows.link);
      updateText("shows-title", data.shows.title);
      updateText("shows-director", data.shows.director);
      updateText("shows-stars", data.shows.stars);
      updateText("shows-subtitle", data.shows.subtitle);
    }

    // 4. Music (Last.fm)
    if (data.music) {
      updateImage("music-img", data.music.image, data.music.title);
      updateHref("music-img-link", data.music.link);
      updateHref("music-title", data.music.link);
      updateText("music-title", data.music.title);
      updateText("music-subtitle", data.music.artist);
    }

    // 5. Games (Backloggd)
    if (data.games) {
      updateImage("games-img", data.games.image, data.games.title);
      updateHref("games-img-link", data.games.link);
      updateHref("games-title", data.games.link);
      updateText("games-title", data.games.title);
      updateText("games-company", data.games.company);
      updateText("games-stars", data.games.stars);
      updateText("games-subtitle", data.games.subtitle);
    }
  } catch (err) {
    console.warn("[now-live] Live feed update skipped due to network/timeout:", err);
  } finally {
    isFetching = false;
  }
}

function startLivePolling() {
  if (pollingTimer) clearInterval(pollingTimer);
  // Poll every 60 seconds
  pollingTimer = setInterval(fetchLiveNowData, 60000);
}

function stopLivePolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

// Handle tab visibility change
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopLivePolling();
  } else {
    fetchLiveNowData();
    startLivePolling();
  }
});

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    fetchLiveNowData();
    startLivePolling();
  });
} else {
  fetchLiveNowData();
  startLivePolling();
}
