export interface IdentityConfig {
  hero: {
    title: string;
    subtitles: string[];
    images: string[];
    intervalMs: number;
    typewriter: { speedMs: number; deleteSpeedMs: number; pauseMs: number };
  };
  profile: { typewriter: boolean; speedMs: number };
  footerMessage: string;
}

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const text = (value: unknown, fallback = '') => (typeof value === 'string' && value.trim() ? value.trim() : fallback);
const duration = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const texts = (value: unknown) => (Array.isArray(value) ? value.flatMap((item) => (text(item) ? [text(item)] : [])) : []);

/** Normalize personal branding and motion data without importing the site assembly layer. */
export function normalizeIdentityConfig(raw: unknown): IdentityConfig {
  const source = record(raw);
  const hero = record(source.hero);
  const typing = record(hero.typewriter);
  const profile = record(source.profile);
  const images = texts(hero.images).filter(
    (image) => image.startsWith('/img/') && !image.includes('\\') && !image.split('/').includes('..') && !/[?#]/.test(image),
  );
  return {
    hero: {
      title: text(hero.title),
      subtitles: texts(hero.subtitles),
      images: [...new Set(images.length ? images : ['/img/site_header_1920.webp'])],
      intervalMs: duration(hero.intervalMs, 3500, 2000, 60000),
      typewriter: {
        speedMs: duration(typing.speedMs, 100, 20, 500),
        deleteSpeedMs: duration(typing.deleteSpeedMs, 20, 10, 500),
        pauseMs: duration(typing.pauseMs, 2000, 500, 30000),
      },
    },
    profile: { typewriter: profile.typewriter !== false, speedMs: duration(profile.speedMs, 80, 20, 500) },
    footerMessage: text(source.footerMessage, '本站由热爱与梦想驱动'),
  };
}
