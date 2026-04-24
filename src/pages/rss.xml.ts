import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '@lib/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );

  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description ?? '',
      pubDate: p.data.publishedAt,
      link: `/blog/${p.id}/`,
      categories: p.data.tags,
    })),
    customData: `<language>ko-kr</language>`,
  });
}
