import assert from 'node:assert/strict';
import test from 'node:test';
import type { Element, Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { rehypeImagePlaceholder } from './rehype-image-placeholder';

async function render(source: string): Promise<string> {
  const processor = unified().use(remarkParse).use(remarkRehype).use(rehypeImagePlaceholder);
  return toHtml((await processor.run(processor.parse(source))) as Root);
}

test('remote Markdown images emit the hotlink policy before their first browser request', async () => {
  const html = await render('![Diagram](https://i-blog.csdnimg.cn/direct/diagram.png)');
  assert.match(html, /<img[^>]+referrerpolicy="no-referrer"/);
  assert.match(html, /loading="lazy" decoding="async"/);
  assert.match(html, /<figure[^>]*>.*<figcaption[^>]*>Diagram<\/figcaption><\/figure>/);
  assert.doesNotMatch(html, /<p><figure/);
});

test('linked images also suppress the referrer without changing their link structure', async () => {
  const html = await render('[![Diagram](https://cdn.example.com/diagram.png)](https://example.com/article)');
  assert.match(html, /<a href="https:\/\/example.com\/article"><img[^>]+referrerpolicy="no-referrer"/);
  assert.doesNotMatch(html, /<figure/);
});

test('images in existing figures get the policy while keeping the authored structure and explicit policy', () => {
  const defaultImage: Element = {
    type: 'element',
    tagName: 'img',
    properties: { src: '//cdn.example.com/a.png' },
    children: [],
  };
  const explicitImage: Element = {
    type: 'element',
    tagName: 'img',
    properties: { src: 'https://cdn.example.com/b.png', referrerPolicy: 'origin' },
    children: [],
  };
  const figure: Element = { type: 'element', tagName: 'figure', properties: {}, children: [defaultImage, explicitImage] };
  const tree: Root = { type: 'root', children: [figure] };
  rehypeImagePlaceholder()(tree);
  assert.equal(tree.children[0], figure);
  assert.equal(defaultImage.properties.referrerPolicy, 'no-referrer');
  assert.equal(explicitImage.properties.referrerPolicy, 'origin');
  assert.equal(figure.children.length, 2);
});

test('local and data images keep their URL and do not receive a remote-image policy', async () => {
  for (const src of ['/img/local.png', 'data:image/png;base64,YQ==']) {
    const html = await render(`![Local](${src})`);
    assert.match(html, new RegExp(`src="${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.doesNotMatch(html, /referrerpolicy/);
  }
});

test('the deployment badge keeps its existing anonymous CORS policy', async () => {
  const html = await render('![Deploy](https://vercel.com/button)');
  assert.match(html, /crossorigin="anonymous"/);
  assert.match(html, /referrerpolicy="no-referrer"/);
});
