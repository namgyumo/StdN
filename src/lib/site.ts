export const site = {
  title: 'std::N',
  shortName: 'std::N',
  description:
    '기본이 탄탄한 주니어 개발자. 알고리즘·자료구조·저수준 언어에 관심이 많은 동의대 컴소공 개발자의 블로그와 포트폴리오.',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://std-n.dev',
  locale: 'ko',
  author: {
    name: 'N',
    handle: 'namgyumo',
    email: 'n.gyumo13@gmail.com',
    boj: 'mjc5433',
    github: 'https://github.com/namgyumo',
    instagram: 'https://instagram.com/east_scale',
  },
  nav: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/skills', label: 'Skills' },
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/now', label: 'Now' },
    { href: '/uses', label: 'Uses' },
    { href: '/contact', label: 'Contact' },
  ],
} as const;

export type SiteConfig = typeof site;
