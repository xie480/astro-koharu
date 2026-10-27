import assert from 'node:assert/strict';
import test from 'node:test';
import type { Root } from 'mdast';
import { classifyLink, extractCodePenId, extractTweetId, isStandaloneLinkParagraph, type MarkdownNode } from './link-utils';
import { remarkLinkEmbed } from './remark-link-embed';

function paragraph(url: string, text = url): MarkdownNode {
  return { type: 'paragraph', children: [{ type: 'link', url, children: [{ type: 'text', value: text }] }] };
}

test('anchors, relative links and non-web schemes stay ordinary Markdown links', () => {
  for (const url of [
    '#4.MQ',
    '/post/example',
    '../notes',
    '//example.com/x',
    'mailto:hello@example.com',
    'javascript:void(0)',
    '',
  ]) {
    assert.equal(isStandaloneLinkParagraph(paragraph(url)), false, url);
  }
  assert.equal(isStandaloneLinkParagraph(paragraph('#4.MQ', '4.MQ')), false);
});

test('valid absolute web URLs retain standalone-embed detection', () => {
  assert.equal(isStandaloneLinkParagraph(paragraph('https://example.com/post')), true);
  assert.equal(isStandaloneLinkParagraph(paragraph('http://example.com/post', 'example.com/post')), true);
  assert.equal(isStandaloneLinkParagraph(paragraph('https://example.com/post', 'Read this article')), false);
  assert.equal(isStandaloneLinkParagraph(paragraph('https://example.com/post', '')), false);
});

test('expected non-URLs do not produce warning stacks from specialised classifiers', (context) => {
  const warn = context.mock.method(console, 'warn', () => {});
  for (const url of ['#4.MQ', '/internal', 'https://', 'mailto:hello@example.com']) {
    assert.equal(extractTweetId(url), null);
    assert.equal(extractCodePenId(url), null);
  }
  assert.equal(warn.mock.callCount(), 0);
});

test('Twitter and CodePen embeds retain their identifiers', () => {
  assert.deepEqual(classifyLink('https://x.com/example/status/123456?s=20'), {
    url: 'https://x.com/example/status/123456?s=20',
    type: 'tweet',
    tweetId: '123456',
  });
  assert.deepEqual(extractCodePenId('https://codepen.io/example/pen/AbCd/'), { user: 'example', penId: 'AbCd' });
  assert.equal(extractTweetId('https://x.com.example.com/example/status/123456'), null);
});

test('the fragment-only remark pipeline preserves its link and never fetches metadata', async (context) => {
  const fetch = context.mock.method(globalThis, 'fetch', async () => {
    throw new Error('An anchor must never trigger a network request');
  });
  const tree: Root = {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'link', url: '#4.MQ', children: [{ type: 'text', value: '4.MQ' }] }] }],
  };
  const before = structuredClone(tree);
  await remarkLinkEmbed()(tree);
  assert.deepEqual(tree, before);
  assert.equal(fetch.mock.callCount(), 0);
});
