import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const postSchema = z.object({
  title: z.string(),
  desc: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string().toLowerCase()).default([]),
  draft: z.boolean().default(false),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: postSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: postSchema,
});

export const collections = { blog, notes };
