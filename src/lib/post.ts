export function getPostSlug(post: { id: string }): string {
  return post.id.replace(/\/index$/, "").replace(/\.(md|mdx)$/, "");
}

export function getPostUrl(post: { id: string; collection?: string }, defaultCollection = "blog"): string {
  const slug = getPostSlug(post);
  const col = post.collection || defaultCollection;
  return `/${col}/${slug}/`;
}
