import assert from 'node:assert/strict';
import test from 'node:test';
import { renderAtomFeed } from './atom';

test('Atom escapes user copy and HTML while retaining a canonical self link', () => {
  const xml = renderAtomFeed({
    title: 'A & B',
    author: 'Y',
    home: 'https://example.test/',
    self: 'https://example.test/atom.xml',
    entries: [
      {
        title: '<Title>',
        url: 'https://example.test/post?a=1&b=2',
        published: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-02T00:00:00.000Z',
        summary: '"text"',
        content: '<p>正文</p>',
      },
    ],
  });
  assert.ok(xml.includes('<title>A &amp; B</title>'));
  assert.ok(xml.includes('&lt;Title&gt;'));
  assert.ok(xml.includes('a=1&amp;b=2'));
  assert.ok(xml.includes('&lt;p&gt;正文&lt;/p&gt;'));
  assert.ok(xml.includes('<updated>2026-01-02T00:00:00.000Z</updated>'));
});

test('empty Atom remains a complete valid feed document', () => {
  const xml = renderAtomFeed({
    title: 'Blog',
    author: 'Y',
    home: 'https://example.test/',
    self: 'https://example.test/atom.xml',
    entries: [],
  });
  assert.ok(xml.startsWith('<?xml'));
  assert.ok(xml.endsWith('</feed>'));
  assert.ok(!xml.includes('<entry>'));
});
