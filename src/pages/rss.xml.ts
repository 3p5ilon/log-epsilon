import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE } from "../consts";

export const GET: APIRoute = async (context) => {
  const blogPosts = (await getCollection("blog", ({ data }) => !data.draft)).map(
    (post) => ({ ...post, collection: "blog" as const }),
  );

  const notes = (await getCollection("notes", ({ data }) => !data.draft)).map(
    (note) => ({ ...note, collection: "notes" as const }),
  );

  const allItems = [...blogPosts, ...notes].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.siteUrl,
    items: allItems.map((item) => ({
      title: item.data.title,
      description: item.data.desc,
      pubDate: item.data.pubDate,
      categories: item.data.tags,
      link: `/${item.collection}/${item.id}/`,
    })),
    customData: `<language>${SITE.language}</language>`,
  });
};
