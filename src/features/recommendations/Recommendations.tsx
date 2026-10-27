import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { useEffect, useState } from 'react';
import {
  DEFAULT_FILTERS,
  filterRecommendations,
  parseRecommendationFilters,
  type Recommendation,
  type RecommendationFilters,
  recommendationCategories,
  recommendationFilterUrl,
} from './model';
import RecommendationCard from './RecommendationCard';
import './recommendations.css';

function CollectionMark() {
  return (
    <svg className="recommendation-collection-mark" viewBox="0 0 104 88" fill="none" aria-hidden="true">
      <path d="M12 69h80M17 20h16v49H17zM38 13h18v56H38zM62 26l15-4 12 46-15 4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 28h8M21 34h8M42 22h10M42 54h10M68 33l8-2M76 62l7-2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m84 8 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor" />
    </svg>
  );
}

function RecommendationCollection({ items }: { items: Recommendation[] }) {
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS);
  useEffect(() => {
    const syncFromUrl = () => setFilters(parseRecommendationFilters(window.location.search));
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const categories = recommendationCategories(items);
  const visible = filterRecommendations(items, filters);
  const hasFilters = Boolean(filters.query || filters.category || filters.sort !== 'recommended');
  const hasExamples = items.some((item) => item.demo);
  const examplesOnly = items.length > 0 && items.every((item) => item.demo);

  const updateFilters = (next: RecommendationFilters, replace = false) => {
    setFilters(next);
    const url = recommendationFilterUrl(window.location.href, next);
    if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    if (replace) window.history.replaceState(window.history.state, '', url);
    else window.history.pushState(window.history.state, '', url);
  };

  return (
    <div className="recommendations">
      <header className="recommendation-intro">
        <div>
          <h2>留给值得回味的事物</h2>
          <p className="recommendation-intro-copy">
            喜欢的故事、看过的作品，还有愿意分享的开源项目。用自己的感受，留下一份私藏。
          </p>
        </div>
        <p className="recommendation-total">
          <b>{items.length}</b>
          <span>{examplesOnly ? '个示例' : '份收录'}</span>
        </p>
      </header>

      {hasExamples && (
        <p className="recommendation-demo-notice" role="note">
          <span>界面预览</span>
          标有「示例」的条目用于展示样式，封面与评分均可替换，不代表博主的真实推荐。
        </p>
      )}

      <div className="recommendation-controls">
        <fieldset className="recommendation-categories">
          <legend>按分类浏览</legend>
          <div>
            <button type="button" aria-pressed={!filters.category} onClick={() => updateFilters({ ...filters, category: '' })}>
              全部<span>{items.length}</span>
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                aria-pressed={filters.category === category}
                onClick={() => updateFilters({ ...filters, category })}
              >
                {category}
                <span>{items.filter((item) => item.category === category).length}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="recommendation-search-row">
          <label className="recommendation-search">
            <span>搜索私藏</span>
            <input
              type="search"
              name="q"
              autoComplete="off"
              maxLength={200}
              value={filters.query}
              placeholder="名称、作者或标签，例如「科幻」…"
              onChange={(event) => updateFilters({ ...filters, query: event.target.value }, true)}
            />
          </label>
          <label className="recommendation-sort">
            <span>排列方式</span>
            <select
              name="sort"
              value={filters.sort}
              onChange={(event) =>
                updateFilters({ ...filters, sort: parseRecommendationFilters(`sort=${event.target.value}`).sort })
              }
            >
              <option value="recommended">推荐顺序</option>
              <option value="rating">评分从高到低</option>
              <option value="newest">最近收录</option>
            </select>
          </label>
        </div>
      </div>

      <div className="recommendation-result-line">
        <output aria-live="polite" aria-atomic="true">
          {filters.category ? `${filters.category} · ` : ''}共 {visible.length} {examplesOnly ? '个示例' : '份收录'}
        </output>
        {hasFilters && (
          <button type="button" onClick={() => updateFilters({ ...DEFAULT_FILTERS })}>
            重置筛选
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="recommendation-grid" aria-label="私藏推荐">
          {visible.map((item) => (
            <li key={item.id}>
              <RecommendationCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="recommendation-empty">
          <CollectionMark />
          <h3>{items.length === 0 ? '第一份私藏，还在整理中' : '这里暂时没有匹配的私藏'}</h3>
          <p>
            {items.length === 0
              ? '等遇到想认真推荐的作品，会把理由和感受一起放在这里。'
              : '换一个分类或关键词，看看还有哪些值得遇见的作品。'}
          </p>
          {hasFilters && (
            <button type="button" onClick={() => updateFilters({ ...DEFAULT_FILTERS })}>
              查看全部私藏
            </button>
          )}
        </div>
      )}
      <p className="recommendation-note">
        {hasExamples
          ? '示例评分只用于预览；真实条目的评分可记录自己的喜好，也可以留白。'
          : '评分只代表个人喜好，留白也可以是一种记录。'}
      </p>
    </div>
  );
}

export default function Recommendations({ items }: { items: Recommendation[] }) {
  return (
    <ErrorBoundary
      fallback={
        <p className="recommendation-error" role="alert">
          私藏推荐暂时无法显示，请刷新页面重试。
        </p>
      }
    >
      <RecommendationCollection items={items} />
    </ErrorBoundary>
  );
}
