import { type PointerEvent, useState } from 'react';
import type { Recommendation } from './model';
import './recommendation-cards.css';

const ratingFormat = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
type RecommendationKind = 'novel' | 'anime' | 'game' | 'opensource' | 'other';

function recommendationKind(category: string): RecommendationKind {
  if (category === '小说') return 'novel';
  if (category === '番剧') return 'anime';
  if (category === '游戏') return 'game';
  if (category === '开源项目') return 'opensource';
  return 'other';
}

function getCloneCommand(repositoryUrl?: string): string | undefined {
  if (!repositoryUrl) return undefined;
  try {
    const url = new URL(repositoryUrl);
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return undefined;
    const [owner, rawRepository, ...extraPath] = url.pathname.split('/').filter(Boolean);
    const repository = rawRepository?.replace(/\.git$/, '');
    const validSegment = (segment?: string) => Boolean(segment && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment));
    if (extraPath.length || !validSegment(owner) || !validSegment(repository)) return undefined;
    return `git clone https://github.com/${owner}/${repository}.git`;
  } catch {
    return undefined;
  }
}

function RecommendationArtwork({
  item,
  kind,
  imageFailed,
  onError,
}: {
  item: Recommendation;
  kind: RecommendationKind;
  imageFailed: boolean;
  onError: () => void;
}) {
  const imageDimensions = kind === 'game' ? { width: 176, height: 144 } : { width: 720, height: 260 };

  return (
    <div className={`recommendation-card-art recommendation-card-art--${kind}`}>
      {item.image && !imageFailed ? (
        <img
          src={item.image}
          alt={`${item.title}封面`}
          {...imageDimensions}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={onError}
        />
      ) : (
        <div className="recommendation-card-art-fallback" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            {kind === 'game' ? (
              <>
                <path d="M12 15h16a5 5 0 0 1 4.8 6.3l-2.1 7a2.4 2.4 0 0 1-4 .9L23 21h-6l-3.7 8.2a2.4 2.4 0 0 1-4-.9l-2.1-7A5 5 0 0 1 12 15Z" />
                <path d="M13 18v6m-3-3h6m10-1h.01M29 23h.01" />
              </>
            ) : (
              <>
                <path d="M8 10h24v18H8zM14 28l5-6 4 4 3-3 6 5" />
                <circle cx="15" cy="16" r="2" />
              </>
            )}
          </svg>
          <span>封面暂缺</span>
        </div>
      )}
      {kind !== 'game' && <span className="recommendation-card-art-label">{item.category}精选</span>}
    </div>
  );
}

function CardCategoryMark({ kind, category }: { kind: RecommendationKind; category: string }) {
  const mark = {
    novel: '文',
    anime: '映',
    game: '玩',
    opensource: '</>',
    other: '藏',
  }[kind];
  return (
    <span className="recommendation-category-mark" aria-hidden="true">
      {kind === 'opensource' ? <code className="recommendation-category-mark-code">{mark}</code> : <span>{mark}</span>}
      <span className="sr-only">{category}</span>
    </span>
  );
}

export default function RecommendationCard({ item }: { item: Recommendation }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [cloneStatus, setCloneStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const tags = item.tags ?? [];
  const kind = recommendationKind(item.category);
  const variant = (item.order ?? 0) % 3;
  const showArtwork = kind !== 'novel' && kind !== 'opensource';
  const cloneCommand = kind === 'opensource' ? getCloneCommand(item.url) : undefined;
  const cloneFeedback =
    cloneStatus === 'copied' ? '克隆命令已复制到剪贴板。' : cloneStatus === 'failed' ? '复制失败，请选中命令手动复制。' : '';
  const copyCloneCommand = async () => {
    if (!cloneCommand) return;
    try {
      await navigator.clipboard.writeText(cloneCommand);
      setCloneStatus('copied');
    } catch {
      setCloneStatus('failed');
    }
  };
  const updateTilt = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    event.currentTarget.style.setProperty('--pointer-x', `${(x * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty('--tilt-x', `${((x - 0.5) * 2.4).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${((0.5 - y) * 2.4).toFixed(2)}deg`);
  };
  const resetTilt = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--pointer-x', '50%');
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <article
      className="recommendation-card"
      data-kind={kind}
      data-category={item.category}
      data-variant={variant}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
    >
      {showArtwork && kind !== 'game' && (
        <RecommendationArtwork item={item} kind={kind} imageFailed={imageFailed} onError={() => setImageFailed(true)} />
      )}

      <div className="recommendation-card-body">
        <div className="recommendation-card-meta">
          <div className="recommendation-card-labels">
            <CardCategoryMark kind={kind} category={item.category} />
            <span>{item.category}</span>
            {item.demo && <span className="recommendation-demo-badge">示例</span>}
          </div>
          {item.rating !== undefined ? (
            <span className="recommendation-rating">
              {item.demo ? (
                <span className="recommendation-rating-label">演示评分</span>
              ) : (
                <span className="sr-only">个人评分</span>
              )}
              <b>{ratingFormat.format(item.rating)}</b>
              <span aria-hidden="true"> / 10</span>
              <span className="sr-only">分，满分 10 分</span>
            </span>
          ) : (
            <span className="recommendation-unrated">未评分</span>
          )}
        </div>

        <div className={`recommendation-card-heading recommendation-card-heading--${kind}`}>
          <div className="recommendation-card-title-group">
            {kind === 'novel' && (
              <p className="recommendation-reading-note">
                文字私藏 <span>·</span> 留给阅读的时间
              </p>
            )}
            <h3 translate={kind === 'opensource' ? 'no' : undefined}>{item.title}</h3>
            {item.author && <p className="recommendation-author">{item.author}</p>}
          </div>
          {kind === 'game' && (
            <RecommendationArtwork item={item} kind={kind} imageFailed={imageFailed} onError={() => setImageFailed(true)} />
          )}
        </div>

        {item.description && <p className="recommendation-description">{item.description}</p>}

        {cloneCommand && (
          <div className="recommendation-clone-panel">
            <div className="recommendation-clone-header">
              <h4>
                <code translate="no">git clone</code> 到本地
              </h4>
              <button type="button" onClick={copyCloneCommand} aria-label={`复制 ${item.title} 的 Git 克隆命令`}>
                复制命令
              </button>
            </div>
            <pre>
              <code translate="no">
                <span className="recommendation-clone-prompt" aria-hidden="true">
                  $
                </span>{' '}
                {cloneCommand}
              </code>
            </pre>
            <output className="recommendation-clone-feedback" aria-live="polite">
              {cloneFeedback}
            </output>
          </div>
        )}

        {tags.length > 0 && (
          <ul className="recommendation-tags" aria-label="标签">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}

        {(item.addedAt || item.url) && (
          <footer className="recommendation-card-footer">
            {item.addedAt ? <time dateTime={item.addedAt}>收录于 {item.addedAt.replaceAll('-', '.')}</time> : <span />}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                查看作品<span className="sr-only">：{item.title}（新窗口）</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M4 12 12 4M4 4h8v8" />
                </svg>
              </a>
            )}
          </footer>
        )}
      </div>
    </article>
  );
}
