import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'log(Ɛ)',
  description:
    'My technical blog where I share my thoughts and experiences on software development, programming languages, and technology in general.',
  href: 'https://3p5ilon.vercel.app',
  author: 'epsilon',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/projects',
    label: 'projects',
  },
  {
    href: '/about',
    label: 'about',
  },
  // {
  //   href: '/tags',
  //   label: 'tags',
  // },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/3p5ilon',
    label: 'GitHub',
  },
  {
    href: 'https://twitter.com/3p5ilon',
    label: 'Twitter',
  },
  {
    href: 'mailto:log3p5ilon@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
