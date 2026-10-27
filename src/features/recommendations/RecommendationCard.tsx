import { useState } from 'react';
import type { Recommendation } from './model';

const ratingFormat = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

export default function RecommendationCard({ item }: { item: Recommendation }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="recommendation-card">
      {item.image && !imageFailed ? (
        <div className="recommendation-card-image">
          <img
            src={item.image}
            alt={item.demo ? `${item.title}的示例封面插画` : `${item.title}封面`}
            width={480}
            height={300}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="recommendation-card-type" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M3 4.5c3-1 6-.5 9 1.5 3-2 6-2.5 9-1.5v14c-3-1-6-.5-9 1.5-3-2-6-2.5-9-1.5zM12 6v14" />
          </svg>
          <span>{item.category}</span>
        </div>
      )}
      <div className="recommendation-card-body">
        <div className="recommendation-card-meta">
          <div className="recommendation-card-labels">
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
            <span>未评分</span>
          )}
        </div>
        <h3>{item.title}</h3>
        {item.author && <p className="recommendation-author">{item.author}</p>}
        {item.description && <p className="recommendation-description">{item.description}</p>}
        {item.tags.length > 0 && (
          <ul className="recommendation-tags" aria-label="标签">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
        {(item.addedAt || item.url) && (
          <footer className="recommendation-card-footer">
            {item.addedAt ? (
              <time dateTime={item.addedAt}>收录于 {dateFormat.format(new Date(`${item.addedAt}T00:00:00Z`))}</time>
            ) : (
              <span />
            )}
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
