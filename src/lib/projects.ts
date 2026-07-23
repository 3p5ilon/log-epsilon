export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export interface ProjectSection {
  title: string;
  projects: Project[];
}

export const PROJECT_SECTIONS: ProjectSection[] = [
  {
    title: "projects",
    projects: [
      {
        title: "feedster",
        description: "all your feeds in one place",
        tags: ["nextjs"],
        link: "https://github.com/3p5ilon/feedster",
      },
      {
        title: "aicademy",
        description: "open source ai education org",
        tags: ["ai", "edu", "oss"],
        link: "https://github.com/aicademyorg",
      },
      {
        title: "middle-earth",
        description: "where teens build cool things!",
        tags: ["club", "hackclub"],
        link: "https://hack2tfuture.github.io",
      },
      {
        title: "nextfolio",
        description: "nextjs portfolio template",
        tags: ["nextjs", "mdx", "tailwind"],
        link: "https://nextfolio-template.vercel.app",
      },
      {
        title: "vibes",
        description: "personal image moodboard",
        tags: ["html", "python"],
        link: "https://github.com/3p5ilon/vibes",
      },
      {
        title: "log epsilon",
        description: "my personal site",
        tags: ["astro", "tailwind"],
        link: "https://github.com/3p5ilon/log-epsilon",
      },
      {
        title: "profilefetch",
        description: "fastfetch style svg generator for your profile",
        tags: ["javascript", "svg"],
        link: "https://github.com/3p5ilon/profilefetch",
      },
      {
        title: "lazyterm",
        description: "terminal bootstrap dev config for unix",
        tags: ["shell", "bash", "cli"],
        link: "https://github.com/3p5ilon/lazyterm",
      },
      {
        title: "dotfiles",
        description: "my dotfiles for macos and linux",
        tags: ["shell", "bash", "cli"],
        link: "https://github.com/3p5ilon/dotfiles",
      },
      {
        title: "fashionx",
        description: "clothing e-commerce platform",
        tags: ["nextjs", "css"],
        link: "https://github.com/3p5ilon/FashionX",
      },
      {
        title: "astrofolio",
        description: "astro portfolio template",
        tags: ["astro", "mdx", "tailwind"],
        link: "https://github.com/3p5ilon/astrofolio",
      },
      {
        title: "pilot",
        description: "agentic ai to neovim + tmux workflow",
        tags: ["lua", "nvim"],
        link: "https://github.com/3p5ilon/pilot",
      },
      {
        title: "trackster",
        description: "install tracks in one go",
        tags: ["python", "css"],
        link: "https://github.com/3p5ilon/trackster",
      },
    ],
  },
  {
    title: "research",
    projects: [
       {
        title: "mithril ai",
        description: "open science ai resarch lab",
        tags: ["ai", "ml", "oss"],
        link: "https://github.com/mithrilai",
      },
    ],
  },
  {
    title: "fun",
    projects: [
      {
        title: "cpvim",
        description: "vim config for competitive programming",
        tags: ["vimscript", "vim"],
        link: "https://github.com/3p5ilon/cpvim",
      },
      {
        title: "leftdays",
        description: "chrome extension for days left in a year",
        tags: ["javascript", "css"],
        link: "https://github.com/3p5ilon/Leftdays",
      },
      {
        title: "epsilon cli",
        description: "my terminal cli site",
        tags: ["javascript", "css"],
        link: "https://github.com/3p5ilon/3p5ilon.github.io",
      },
      {
        title: "med-inventory",
        description: "inventory management for medical stores",
        tags: ["typescript", "db", "css"],
        link: "https://github.com/3p5ilon/MedInventory",
      },
      {
        title: "sha 256",
        description: "sha 256 cryptographic hash algorithm",
        tags: ["cpp", "algo"],
        link: "https://github.com/3p5ilon/SHA-256-Algorithm",
      },
    ],
  },
];
