import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DEFAULT_FILTERS,
  filterRecommendations,
  parseRecommendationFilters,
  parseRecommendations,
  recommendationFilterUrl,
} from './model';

const items = parseRecommendations([
  { id: 'unrated', title: '未评分条目', category: '小说', addedAt: '2026-01-01' },
  { id: 'zero', title: '零分条目', category: '漫画', rating: 0, description: '雨天的故事' },
  { id: 'rated', title: 'Paper Tools', category: '开源项目', rating: 8.5, addedAt: '2026-02-01', tags: ['工具'] },
]);

test('optional metadata remains absent and zero is a real rating', () => {
  assert.equal(items[0].rating, undefined);
  assert.equal(items[0].image, undefined);
  assert.equal(items[1].rating, 0);
  assert.deepEqual(items[0].tags, []);
  assert.equal(items[0].demo, false);
});

test('demo is explicitly boolean and does not turn ordinary entries into samples', () => {
  const base = { id: 'preview', title: '界面预览', category: '其他' };
  assert.equal(parseRecommendations([{ ...base, demo: true }])[0].demo, true);
  assert.equal(parseRecommendations([{ ...base, demo: false }])[0].demo, false);
  for (const demo of ['true', 1, null, []]) {
    assert.throws(() => parseRecommendations([{ ...base, demo }]), /demo/);
  }
});

test('the hand-maintained collection validates and its local cover assets are complete', () => {
  const collection = parseRecommendations(
    JSON.parse(readFileSync(new URL('../../data/recommendations.json', import.meta.url), 'utf8')),
  );
  for (const item of collection.filter((entry) => entry.image?.startsWith('/'))) {
    const cover = readFileSync(new URL(`../../../public${item.image}`, import.meta.url));
    assert.ok(cover.length > 0, `${item.id} 的本地封面不能为空`);
    if (item.demo && item.image?.endsWith('.svg')) {
      const svg = cover.toString('utf8');
      assert.match(svg, /示例封面/);
      assert.doesNotMatch(svg, /<script|<image|<foreignObject/i);
    }
  }
});

test('ratings put unscored entries after a real zero; dates put undated entries last', () => {
  assert.deepEqual(
    filterRecommendations(items, { ...DEFAULT_FILTERS, sort: 'rating' }).map((item) => item.id),
    ['rated', 'zero', 'unrated'],
  );
  assert.deepEqual(
    filterRecommendations(items, { ...DEFAULT_FILTERS, sort: 'newest' }).map((item) => item.id),
    ['rated', 'unrated', 'zero'],
  );
});

test('search covers descriptions and tags, combines with category and does not mutate data', () => {
  const before = JSON.stringify(items);
  assert.deepEqual(
    filterRecommendations(items, { ...DEFAULT_FILTERS, query: '雨天', category: '漫画' }).map((item) => item.id),
    ['zero'],
  );
  assert.deepEqual(
    filterRecommendations(items, { ...DEFAULT_FILTERS, query: 'PAPER' }).map((item) => item.id),
    ['rated'],
  );
  assert.deepEqual(filterRecommendations(items, { ...DEFAULT_FILTERS, query: '工具', category: '小说' }), []);
  assert.equal(JSON.stringify(items), before);
});

test('recommended order is explicit and ties stay in source order', () => {
  const ranked = parseRecommendations([
    { id: 'first', title: '第一项', category: '其他', order: 5 },
    { id: 'second', title: '第二项', category: '其他', order: 1 },
    { id: 'third', title: '第三项', category: '其他', order: 1 },
  ]);
  assert.deepEqual(
    filterRecommendations(ranked, DEFAULT_FILTERS).map((item) => item.id),
    ['second', 'third', 'first'],
  );
});

test('invalid ratings, repeated IDs, unsafe URLs and impossible dates fail at the data boundary', () => {
  const base = { id: 'sample', title: '示例', category: '小说' };
  for (const invalid of [
    { rating: 11 },
    { rating: '8' },
    { url: 'javascript:alert(1)' },
    { image: '//example.com/image.png' },
    { image: '/../image.png' },
    { addedAt: '2026-02-30' },
  ]) {
    assert.throws(() => parseRecommendations([{ ...base, ...invalid }]));
  }
  assert.throws(() => parseRecommendations([base, base]), /重复/);
  assert.equal(
    parseRecommendations([{ ...base, image: '/img/book.webp', url: 'https://example.com/book' }])[0].image,
    '/img/book.webp',
  );
});

test('filter URLs preserve unrelated parameters and roundtrip Unicode without stale defaults', () => {
  const filters = { query: '夜 雨', category: '小说', sort: 'rating' as const };
  const url = recommendationFilterUrl('https://example.com/recommendations?source=home#collection', filters);
  assert.deepEqual(parseRecommendationFilters(new URL(url, 'https://example.com').search), filters);
  assert.equal(
    recommendationFilterUrl(`https://example.com${url}`, DEFAULT_FILTERS),
    '/recommendations?source=home#collection',
  );
  assert.equal(parseRecommendationFilters('?sort=invalid').sort, 'recommended');
});
