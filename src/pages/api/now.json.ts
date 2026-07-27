import type { APIRoute } from "astro";
import { getNowFeeds } from "../../lib/now";

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await getNowFeeds();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
    },
  });
};
