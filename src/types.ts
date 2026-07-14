export type Site = {
  title: string;
  desc: string;
  author: string;
  siteUrl: string;
  ogImage: string;
  language: string;
};

export type Link = {
  href: string;
  label: string;
};

export type Post = {
  readingTime: boolean;
  tagsPosition: "top" | "bottom" | "hidden";
};
