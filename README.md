# log(Ɛ)

My technical blog website, built with Astro (forked from [astro-erudite](https://github.com/jktrn/astro-erudite))

## Quick Start

```bash
# Clone and install
git clone https://github.com/3p5ilon/log-epsilon.git
cd log-epsilon
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Tech Stack

- **Framework:** [Astro](https://astro.build)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI:** [shadcn/ui](https://ui.shadcn.com)
- **Content:** MDX with [Expressive Code](https://expressive-code.com)
- **Deployment:** [Vercel](https://vercel.com)

## Configuration

Edit `src/consts.ts` for site metadata and links. Colors in `src/styles/global.css` use OKLCH format.

## Adding Content

- **Blog posts:** Add MDX files to `src/content/blog/` with required frontmatter (`title`, `description`, `date`)
- **Authors:** Add Markdown files to `src/content/authors/`
- **Projects:** Add Markdown files to `src/content/projects/`

## License

[MIT](LICENSE)
