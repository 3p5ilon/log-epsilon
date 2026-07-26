export function decodeEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function formatRating(rating?: string | number): string {
  if (rating === undefined || rating === null || rating === "") return "";
  const num = typeof rating === "number" ? rating : parseFloat(rating);
  if (isNaN(num)) return "";
  return "★".repeat(Math.floor(num)) + (num % 1 >= 0.5 ? "½" : "");
}

export function fetchTimeout(url: string, ms = 4000, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}
