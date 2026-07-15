import type { Site, Link, Post } from "./types";

export const SITE: Site = {
  title: "Ɛpsilon",
  desc: "AI researcher, entrepreneur, and developer.",
  author: "Ɛpsilon",
  siteUrl: "https://3p5ilon.vercel.app",
  ogImage: "/banner.svg",
  language: "en",
};

export const NAV_LINKS: Link[] = [
  { href: "/", label: "/" },
  { href: "/blog", label: "/log" },
  { href: "/notes", label: "/notes" },
  { href: "/labs", label: "/lab" },
  { href: "/library", label: "/library" },
  { href: "https://log-epsilon.vercel.app", label: "$" },
];

export const SOCIAL_LINKS: Link[] = [
  { href: "https://x.com/3p5ilon", label: "[/x]" },
  { href: "https://github.com/3p5ilon", label: "[/github]" },
  { href: "mailto:hi3psilon@gmail.com", label: "[/email]" },
  { href: "/rss.xml", label: "[/rss]" },
];

export const POST: Post = {
  readingTime: false,
  tagsPosition: "bottom" , // "top" | "bottom" | "hidden"
};
