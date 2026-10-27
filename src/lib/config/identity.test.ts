import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeIdentityConfig } from './identity';

test('absent personal configuration has a static working image and safe timings', () => {
  const result = normalizeIdentityConfig(undefined);
  assert.deepEqual(result.hero.images, ['/img/site_header_1920.webp']);
  assert.equal(result.hero.intervalMs, 3500);
  assert.equal(result.profile.speedMs, 80);
});

test('hero accepts ordered local images and rejects unsafe paths', () => {
  const result = normalizeIdentityConfig({
    hero: { images: ['/img/a.webp', '/img/a.webp', '//evil.test/a', '/img/../secret', '/img/b.webp?x=1', '/img/c.webp'] },
  });
  assert.deepEqual(result.hero.images, ['/img/a.webp', '/img/c.webp']);
});

test('partial configuration preserves copy and bounds motion settings', () => {
  const result = normalizeIdentityConfig({
    hero: { title: '  夢の終着駅  ', subtitles: ['言葉', null, ''], intervalMs: -1, typewriter: { speedMs: 0 } },
    profile: { typewriter: false, speedMs: Number.NaN },
  });
  assert.equal(result.hero.title, '夢の終着駅');
  assert.deepEqual(result.hero.subtitles, ['言葉']);
  assert.equal(result.hero.intervalMs, 2000);
  assert.equal(result.hero.typewriter.speedMs, 20);
  assert.equal(result.profile.typewriter, false);
  assert.equal(result.profile.speedMs, 80);
});
