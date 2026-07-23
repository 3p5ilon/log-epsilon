import { defineConfig, passthroughImageService } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { fileURLToPath, URL } from "node:url";
import { SITE } from "./src/consts";

export default defineConfig({
  site: SITE.siteUrl,
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    expressiveCode({
      themes: ["catppuccin-mocha", "catppuccin-latte"],
      plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? "[data-theme='dark']" : ":root:not([data-theme='dark'])",
      styleOverrides: {
        borderRadius: "0",
      },
      defaultProps: {
        showLineNumbers: false,
      },
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});