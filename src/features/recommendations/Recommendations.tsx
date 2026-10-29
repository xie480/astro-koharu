import { ErrorBoundary } from '@components/common/ErrorBoundary';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_FILTERS,
  filterRecommendations,
  parseRecommendationFilters,
  type Recommendation,
  type RecommendationFilters,
  type RecommendationSort,
  recommendationCategories,
  recommendationFilterUrl,
} from './model';
import RecommendationCard from './RecommendationCard';
import './recommendations.css';

const SORT_OPTIONS: { value: RecommendationSort; label: string }[] = [
  { value: 'random', label: '随机打乱' },
  { value: 'recommended', label: '推荐顺序' },
  { value: 'rating', label: '评分从高到低' },
  { value: 'newest', label: '最近收录' },
];

function createRandomOrder(items: readonly Recommendation[]): ReadonlyMap<string, number> {
  const ids = items.map((item) => item.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  return new Map(ids.map((id, index) => [id, index]));
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

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
  const [randomOrder, setRandomOrder] = useState<ReadonlyMap<string, number>>();
  const [tagSearch, setTagSearch] = useState('');
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const tagControlRef = useRef<HTMLDivElement>(null);
  const tagTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const syncFromUrl = () => setFilters(parseRecommendationFilters(window.location.search));
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    const shuffle = () => setRandomOrder(createRandomOrder(items));
    const reshuffleWhenRestored = (event: PageTransitionEvent) => {
      if (event.persisted) shuffle();
    };
    shuffle();
    window.addEventListener('pageshow', reshuffleWhenRestored);
    return () => window.removeEventListener('pageshow', reshuffleWhenRestored);
  }, [items]);

  useEffect(() => {
    if (!tagPopoverOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !tagControlRef.current?.contains(event.target)) setTagPopoverOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTagPopoverOpen(false);
        tagTriggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePress, true);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress, true);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [tagPopoverOpen]);

  const categories = recommendationCategories(items);
  const tags = [...new Set(items.flatMap((item) => item.tags ?? []))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const selectedTags = filters.tags ?? [];
  const tagQuery = tagSearch.trim().toLocaleLowerCase('zh-CN');
  const matchingTags = tags.filter((tag) => !tagQuery || tag.toLocaleLowerCase('zh-CN').includes(tagQuery));
  const tagCounts = new Map(tags.map((tag) => [tag, items.filter((item) => item.tags?.includes(tag)).length]));
  const visible = filterRecommendations(items, filters, randomOrder);
  const hasFilters = Boolean(filters.query || filters.category || selectedTags.length || filters.sort !== 'random');
  const hasExamples = items.some((item) => item.demo);
  const examplesOnly = items.length > 0 && items.every((item) => item.demo);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ?? SORT_OPTIONS[0].label;

  const updateFilters = (next: RecommendationFilters, replace = false) => {
    const normalized = { ...next, tags: [...new Set(next.tags ?? [])] };
    setFilters(normalized);
    const url = recommendationFilterUrl(window.location.href, normalized);
    if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    if (replace) window.history.replaceState(window.history.state, '', url);
    else window.history.pushState(window.history.state, '', url);
  };

  const setTagSelected = (tag: string, checked: boolean) => {
    const nextTags = checked ? [...selectedTags, tag] : selectedTags.filter((selected) => selected !== tag);
    updateFilters({ ...filters, tags: nextTags });
  };

  return (
    <div className="recommendations">
      <header className="recommendation-intro">
        <div>
          <h2>留给值得回味的事物</h2>
          <p className="recommendation-intro-copy">
            喜欢的故事、看过的作品、玩过的游戏，还有愿意分享的开源项目。用自己的感受，留下一份私藏。
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

          <div className="recommendation-filter-controls">
            <div className="recommendation-filter-control">
              <span>筛选标签</span>
              <div className="recommendation-tag-control" ref={tagControlRef}>
                <button
                  ref={tagTriggerRef}
                  type="button"
                  className="recommendation-control-button recommendation-tag-trigger"
                  aria-describedby="recommendation-tag-description"
                  aria-expanded={tagPopoverOpen}
                  aria-controls="recommendation-tag-popover"
                  aria-haspopup="dialog"
                  onClick={() => setTagPopoverOpen((open) => !open)}
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M3 4h14l-5.5 6.3V16l-3 1v-6.7L3 4Z" />
                  </svg>
                  <span>标签</span>
                  {selectedTags.length > 0 && <span className="recommendation-filter-count">{selectedTags.length}</span>}
                  <ChevronIcon />
                </button>
                {tagPopoverOpen && (
                  <div
                    id="recommendation-tag-popover"
                    className="recommendation-tag-popover"
                    role="dialog"
                    aria-label="筛选标签"
                  >
                    <div className="recommendation-tag-menu">
                      <label className="recommendation-tag-search">
                        <span>搜索标签</span>
                        <input
                          type="search"
                          name="tag-search"
                          autoComplete="off"
                          value={tagSearch}
                          placeholder="输入关键词…"
                          onChange={(event) => setTagSearch(event.target.value)}
                        />
                      </label>
                      <p className="recommendation-tag-help">可多选；条目命中任一已选标签即可显示。</p>
                      <fieldset className="recommendation-tag-options">
                        <legend className="sr-only">可选标签</legend>
                        {matchingTags.length > 0 ? (
                          matchingTags.map((tag) => (
                            <label key={tag} className="recommendation-tag-option">
                              <input
                                type="checkbox"
                                name="tag"
                                value={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={(event) => setTagSelected(tag, event.currentTarget.checked)}
                              />
                              <span>{tag}</span>
                              <small>{tagCounts.get(tag)}</small>
                            </label>
                          ))
                        ) : (
                          <p className="recommendation-tag-empty">没有匹配的标签</p>
                        )}
                      </fieldset>
                      {selectedTags.length > 0 && (
                        <button
                          type="button"
                          className="recommendation-tag-clear"
                          onClick={() => updateFilters({ ...filters, tags: [] })}
                        >
                          清除已选标签
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span id="recommendation-tag-description" className="sr-only">
                搜索并多选标签，条目命中任一标签时显示。
              </span>
            </div>

            <div className="recommendation-filter-control">
              <span>排列方式</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="recommendation-control-button recommendation-sort-trigger">
                    <span>{sortLabel}</span>
                    <ChevronIcon />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="recommendation-sort-menu">
                  <DropdownMenuLabel>排列方式</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={filters.sort}
                    onValueChange={(value) => updateFilters({ ...filters, sort: value as RecommendationSort })}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value} className="recommendation-sort-option">
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <fieldset className="recommendation-selected-tags">
          <legend className="sr-only">已选择的标签</legend>
          <span>命中任一</span>
          {selectedTags.map((tag) => (
            <button key={tag} type="button" aria-label={`移除标签 ${tag}`} onClick={() => setTagSelected(tag, false)}>
              {tag}
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </fieldset>
      )}

      <div className="recommendation-result-line">
        <output aria-live="polite" aria-atomic="true">
          {filters.category ? `${filters.category} · ` : ''}共 {visible.length} {examplesOnly ? '个示例' : '份收录'}
        </output>
        {hasFilters && (
          <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)}>
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
              : '换一个分类、标签或关键词，看看还有哪些值得遇见的作品。'}
          </p>
          {hasFilters && (
            <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)}>
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
