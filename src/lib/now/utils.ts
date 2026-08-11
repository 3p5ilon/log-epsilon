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

export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  "Sec-Ch-Ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export function htmlFetchInit(timeoutMs = 5000): RequestInit {
  return {
    cache: "no-store",
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  };
}

export function jsonFetchInit(extra: HeadersInit = {}, timeoutMs = 5000): RequestInit {
  return {
    cache: "no-store",
    headers: { ...BROWSER_HEADERS, Accept: "application/json", ...extra },
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
