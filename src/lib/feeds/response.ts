import { siteConfig } from '@lib/config/site';
import { getPostSlug, getSortedPosts } from '@lib/content';
import { encodeSlug } from '@lib/route';
import { buildRssItemFields } from '@lib/rss-utils';
import type { APIContext } from 'astro';
import { localizedPath } from '@/i18n';
import { renderAtomFeed } from './atom';

export async function atomResponse(context: APIContext, locale: string): Promise<Response> {
  if (!context.site) throw new Error('Missing site metadata');
  const origin = context.site;
  const posts = await getSortedPosts(locale);
  const entries = posts.slice(0, 20).map((post) => {
    const fields = buildRssItemFields(post, locale);
    return {
      title: fields.title,
      summary: fields.description,
      content: fields.content,
      url: new URL(localizedPath(`/post/${encodeSlug(getPostSlug(post))}`, locale), origin).href,
      published: post.data.date.toISOString(),
      updated: (post.data.updated ?? post.data.date).toISOString(),
    };
  });
  return new Response(
    renderAtomFeed({
      title: siteConfig.title,
      author: siteConfig.author ?? siteConfig.name,
      home: new URL(localizedPath('/', locale), origin).href,
      self: new URL(localizedPath('/atom.xml', locale), origin).href,
      entries,
    }),
    { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } },
  );
}
