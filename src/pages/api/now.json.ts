import type { APIRoute } from "astro";
import { getNowFeeds } from "../../lib/now";

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await getNowFeeds();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    },
  });
};
