import { readMotionLevel, subscribeMotionLevel } from '@lib/motion-level';

/** Enhance the static catalog without changing its DOM or keyboard reading order. */
export function setupProjectCatalog(root: HTMLElement): () => void {
  const category = root.querySelector<HTMLSelectElement>('[data-project-category]');
  const status = root.querySelector<HTMLSelectElement>('[data-project-status]');
  const count = root.querySelector<HTMLElement>('[data-project-count]');
  const empty = root.querySelector<HTMLElement>('[data-project-empty]');
  const controls = root.querySelector<HTMLElement>('[data-project-controls]');
  const grid = root.querySelector<HTMLElement>('[data-project-grid]');
  if (!category || !status || !count || !empty || !controls || !grid) return () => {};

  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-project-card]'));
  const controller = new AbortController();
  const desktop = window.matchMedia('(min-width: 768px)');
  let disposed = false;
  let layoutFrame = 0;
  let gridWidth = 0;
  let revealObserver: IntersectionObserver | undefined;

  function layout() {
    layoutFrame = 0;
    if (disposed) return;
    if (!desktop.matches) {
      grid?.removeAttribute('data-masonry');
      return;
    }
    if (!grid) return;
    const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 24;
    // Measure natural heights first, then write all row spans together. One-pixel
    // virtual rows let each column continue immediately after its own last card.
    const heights = cards.map((card) => (card.hidden ? 0 : card.getBoundingClientRect().height));
    cards.forEach((card, index) => {
      if (heights[index] > 0) card.style.setProperty('--project-span', String(Math.ceil(heights[index] + gap)));
    });
    grid.setAttribute('data-masonry', '');
  }

  function scheduleLayout() {
    if (!disposed && !layoutFrame) layoutFrame = requestAnimationFrame(layout);
  }

  function applyFilters(syncUrl: boolean) {
    let visible = 0;
    for (const card of cards) {
      card.hidden = Boolean(
        (category?.value && card.dataset.category !== category.value) ||
          (status?.value && card.dataset.status !== status.value),
      );
      if (!card.hidden) visible++;
    }
    if (count) count.textContent = `显示 ${visible} / ${cards.length} 个项目`;
    if (empty) empty.hidden = visible > 0;
    if (syncUrl) {
      const url = new URL(window.location.href);
      const filters = { category: category?.value ?? '', status: status?.value ?? '' };
      for (const [key, value] of Object.entries(filters)) {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      window.history.pushState(null, '', url);
    }
    scheduleLayout();
  }

  function restoreFilters() {
    const params = new URLSearchParams(window.location.search);
    for (const select of [category, status]) {
      if (!select) continue;
      const value = params.get(select.name) ?? '';
      select.value = Array.from(select.options).some((option) => option.value === value) ? value : '';
    }
    applyFilters(false);
  }

  function syncMotion() {
    revealObserver?.disconnect();
    const level = readMotionLevel();
    root.dataset.projectMotion = level;
    if (level === 'reduced' || typeof IntersectionObserver === 'undefined') return;
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // Content stays visible without JS, unsupported observers, or animation.
          (entry.target as HTMLElement).dataset.entered = '';
          revealObserver?.unobserve(entry.target);
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' },
    );
    for (const card of cards) {
      if (!card.hasAttribute('data-entered')) revealObserver.observe(card);
    }
  }

  const resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver((entries) => {
          if (
            entries.some((entry) => {
              if (entry.target !== grid) return true;
              const changed = Math.abs(entry.contentRect.width - gridWidth) > 0.5;
              gridWidth = entry.contentRect.width;
              return changed;
            })
          ) {
            scheduleLayout();
          }
        });
  resizeObserver?.observe(grid);
  for (const card of cards) resizeObserver?.observe(card);
  for (const select of [category, status]) {
    select.addEventListener('change', () => applyFilters(true), { signal: controller.signal });
  }
  window.addEventListener('popstate', restoreFilters, { signal: controller.signal });
  window.addEventListener('resize', scheduleLayout, { signal: controller.signal });
  desktop.addEventListener('change', scheduleLayout, { signal: controller.signal });
  root.addEventListener('load', scheduleLayout, { capture: true, signal: controller.signal });
  root.addEventListener('error', scheduleLayout, { capture: true, signal: controller.signal });
  void document.fonts?.ready.then(scheduleLayout);
  const unsubscribeMotion = subscribeMotionLevel(syncMotion);
  syncMotion();
  controls.hidden = false;
  restoreFilters();

  return () => {
    disposed = true;
    controller.abort();
    cancelAnimationFrame(layoutFrame);
    resizeObserver?.disconnect();
    revealObserver?.disconnect();
    unsubscribeMotion();
    grid.removeAttribute('data-masonry');
    root.removeAttribute('data-project-motion');
    for (const card of cards) {
      card.style.removeProperty('--project-span');
      card.removeAttribute('data-entered');
    }
  };
}
