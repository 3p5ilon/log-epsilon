export function decodeEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export const NO_CACHE_HEADERS: HeadersInit = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
};

export function htmlFetchInit(timeoutMs = 5000): RequestInit {
  return {
    cache: "no-store",
    headers: { "User-Agent": UA, Accept: "text/html", ...NO_CACHE_HEADERS },
    signal: AbortSignal.timeout(timeoutMs),
  };
}

export function jsonFetchInit(extra: HeadersInit = {}, timeoutMs = 5000): RequestInit {
  return {
    cache: "no-store",
    headers: { "User-Agent": UA, Accept: "application/json", ...NO_CACHE_HEADERS, ...extra },
    signal: AbortSignal.timeout(timeoutMs),
  };
}

export function starsFromDecimal(n: number | string | undefined): string | undefined {
  if (n === undefined || n === null || n === "") return undefined;
  const num = typeof n === "number" ? n : parseFloat(String(n));
  if (isNaN(num) || num <= 0) return undefined;
  const stars = "★".repeat(Math.floor(num)) + (num % 1 >= 0.5 ? "½" : "");
  return stars || undefined;
}

export function starsFromTen(raw: number | string | undefined): string | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw));
  if (isNaN(n) || n <= 0) return undefined;
  return starsFromDecimal(n / 2);
}

export function tmdbImage(path: string | undefined, size = "w500"): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `https://image.tmdb.org/t/p/${size}${path}`;
}
