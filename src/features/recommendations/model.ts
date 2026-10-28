export const RECOMMENDATION_CATEGORIES = ['小说', '漫画', '番剧', '游戏', '开源项目', '其他'] as const;

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  /** UI preview content, never a claim about the author's actual preferences. */
  demo: boolean;
  description?: string;
  author?: string;
  image?: string;
  url?: string;
  /** Personal rating on a 0–10 scale; absence means not rated. */
  rating?: number;
  /** ISO calendar date, without an invented time or timezone. */
  addedAt?: string;
  /** Smaller values appear first in the recommended order. */
  order?: number;
  tags: string[];
}

export type RecommendationSort = 'recommended' | 'rating' | 'newest';

export interface RecommendationFilters {
  query: string;
  category: string;
  sort: RecommendationSort;
}

export const DEFAULT_FILTERS: RecommendationFilters = { query: '', category: '', sort: 'recommended' };

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error(`推荐数据 ${field} 必须是文本。`);
  return value.trim() || undefined;
}

function requiredText(value: unknown, field: string): string {
  const text = optionalText(value, field);
  if (!text) throw new Error(`推荐数据缺少 ${field}。`);
  return text;
}

function optionalUrl(value: unknown, field: string, allowLocal = false): string | undefined {
  const text = optionalText(value, field);
  if (!text) return undefined;
  if (allowLocal && text.startsWith('/') && !text.startsWith('//')) {
    if (text.includes('\\') || text.split('/').includes('..') || /[?#]/.test(text)) {
      throw new Error(`推荐数据 ${field} 必须是 public 中的绝对图片路径。`);
    }
    return text;
  }
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`推荐数据 ${field} 必须是有效的 HTTP(S) 地址。`);
  }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`推荐数据 ${field} 必须是无凭据的 HTTP(S) 地址。`);
  }
  return text;
}

function optionalDate(value: unknown, field: string): string | undefined {
  const date = optionalText(value, field);
  if (!date) return undefined;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`推荐数据 ${field} 必须是 YYYY-MM-DD 格式的有效日期。`);
  }
  return date;
}

/** Validate hand-maintained JSON at the build boundary, before it reaches a page. */
export function parseRecommendations(raw: unknown): Recommendation[] {
  if (!Array.isArray(raw)) throw new Error('推荐数据必须是数组。');
  const ids = new Set<string>();
  return raw.map((value: unknown, index) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`推荐数据第 ${index + 1} 项必须是对象。`);
    }
    const item = value as Record<string, unknown>;
    const id = requiredText(item.id, `第 ${index + 1} 项的 id`);
    if (ids.has(id)) throw new Error(`推荐数据 id 重复：${id}`);
    ids.add(id);
    if (
      item.rating !== undefined &&
      (typeof item.rating !== 'number' || !Number.isFinite(item.rating) || item.rating < 0 || item.rating > 10)
    ) {
      throw new Error(`推荐数据 ${id}.rating 必须是 0 到 10 的数字。`);
    }
    if (item.order !== undefined && (typeof item.order !== 'number' || !Number.isFinite(item.order))) {
      throw new Error(`推荐数据 ${id}.order 必须是有限数字。`);
    }
    if (item.demo !== undefined && typeof item.demo !== 'boolean') {
      throw new Error(`推荐数据 ${id}.demo 必须是布尔值。`);
    }
    if (item.tags !== undefined && (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== 'string'))) {
      throw new Error(`推荐数据 ${id}.tags 必须是文本数组。`);
    }
    return {
      id,
      title: requiredText(item.title, `${id}.title`),
      category: requiredText(item.category, `${id}.category`),
      demo: item.demo === true,
      description: optionalText(item.description, `${id}.description`),
      author: optionalText(item.author, `${id}.author`),
      image: optionalUrl(item.image, `${id}.image`, true),
      url: optionalUrl(item.url, `${id}.url`),
      rating: item.rating as number | undefined,
      addedAt: optionalDate(item.addedAt, `${id}.addedAt`),
      order: item.order as number | undefined,
      tags: [...new Set(((item.tags as string[] | undefined) ?? []).map((tag) => tag.trim()).filter(Boolean))],
    };
  });
}

export function recommendationCategories(items: readonly Recommendation[]): string[] {
  return [...new Set([...RECOMMENDATION_CATEGORIES, ...items.map((item) => item.category)])];
}

export function parseRecommendationFilters(search: string): RecommendationFilters {
  const params = new URLSearchParams(search);
  const sort = params.get('sort');
  return {
    query: (params.get('q') ?? '').slice(0, 200),
    category: (params.get('category') ?? '').slice(0, 80),
    sort: sort === 'rating' || sort === 'newest' ? sort : 'recommended',
  };
}

/** Preserve unrelated parameters and fragments while editing this page's shareable filters. */
export function recommendationFilterUrl(currentUrl: string, filters: RecommendationFilters): string {
  const url = new URL(currentUrl);
  for (const [key, value] of Object.entries({
    q: filters.query,
    category: filters.category,
    sort: filters.sort === 'recommended' ? '' : filters.sort,
  })) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function filterRecommendations(items: readonly Recommendation[], filters: RecommendationFilters): Recommendation[] {
  const query = filters.query.trim().toLocaleLowerCase('zh-CN');
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !filters.category || item.category === filters.category)
    .filter(
      ({ item }) =>
        !query ||
        [item.title, item.author, item.description, item.category, ...item.tags]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('zh-CN')
          .includes(query),
    )
    .sort((a, b) => {
      if (filters.sort === 'rating') {
        const difference = (b.item.rating ?? -1) - (a.item.rating ?? -1);
        if (difference) return difference;
      }
      if (filters.sort === 'newest') {
        const difference = (b.item.addedAt ?? '').localeCompare(a.item.addedAt ?? '');
        if (difference) return difference;
      }
      return (a.item.order ?? a.index) - (b.item.order ?? b.index) || a.index - b.index;
    })
    .map(({ item }) => item);
}
