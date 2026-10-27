import { readMotionLevel, subscribeMotionLevel } from '@lib/motion-level';

/** Progressive enhancement: every event is visible before this element upgrades. */
class PersonalTimeline extends HTMLElement {
  private abort?: AbortController;
  private unsubscribe?: () => void;
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private frame = 0;
  private animations = new Set<Animation>();
  private seen = new WeakSet<Element>();

  connectedCallback() {
    this.abort = new AbortController();
    const { signal } = this.abort;
    const timeline = this.querySelector<HTMLElement>('[data-timeline]');
    if (!timeline) return;
    const progress = this.querySelector<HTMLElement>('[data-timeline-progress]');
    const sections = [...this.querySelectorAll<HTMLElement>('[data-year]')];
    const yearLinks = [...this.querySelectorAll<HTMLAnchorElement>('[data-year-link]')];
    const update = () => {
      this.frame = 0;
      if (signal.aborted || !this.isConnected) return;
      const readingLine = window.innerHeight * 0.42;
      const rect = timeline.getBoundingClientRect();
      const fraction = Math.min(1, Math.max(0, (readingLine - rect.top) / Math.max(1, rect.height)));
      progress?.style.setProperty('transform', `scaleY(${fraction})`);
      let current = sections[0]?.dataset.year;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section.dataset.year;
      }
      for (const link of yearLinks) {
        if (link.dataset.yearLink === current) link.setAttribute('aria-current', 'date');
        else link.removeAttribute('aria-current');
      }
    };
    const schedule = () => {
      if (!this.frame && !signal.aborted) this.frame = window.requestAnimationFrame(update);
    };
    const syncMotion = () => {
      if (signal.aborted) return;
      this.observer?.disconnect();
      this.observer = undefined;
      for (const animation of this.animations) animation.cancel();
      this.animations.clear();
      const reduced = readMotionLevel() === 'reduced';
      this.toggleAttribute('data-motion-reduced', reduced);
      if (!reduced && typeof IntersectionObserver !== 'undefined') {
        this.observer = new IntersectionObserver(
          (entries) => {
            if (signal.aborted || readMotionLevel() === 'reduced') return;
            for (const entry of entries) {
              if (!entry.isIntersecting || this.seen.has(entry.target)) continue;
              this.seen.add(entry.target);
              this.observer?.unobserve(entry.target);
              if (typeof entry.target.animate !== 'function') continue;
              const subtle = readMotionLevel() === 'subtle';
              const animation = entry.target.animate(
                [
                  { opacity: 0.35, transform: `translateY(${subtle ? 8 : 24}px)` },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                { duration: subtle ? 240 : 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
              );
              this.animations.add(animation);
              animation.finished.then(() => this.animations.delete(animation)).catch(() => {});
            }
          },
          { rootMargin: '0px 0px -6% 0px', threshold: 0.02 },
        );
        this.querySelectorAll('.timeline-event').forEach((event) => {
          if (!this.seen.has(event)) this.observer?.observe(event);
        });
      }
      schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true, signal });
    window.addEventListener('resize', schedule, { passive: true, signal });
    this.addEventListener('toggle', schedule, { capture: true, signal });
    document.addEventListener('astro:before-swap', () => this.cleanup(), { once: true, signal });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(schedule);
      this.resizeObserver.observe(timeline);
    }
    this.unsubscribe = subscribeMotionLevel(syncMotion);
    syncMotion();
  }

  private cleanup() {
    this.abort?.abort();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    window.cancelAnimationFrame(this.frame);
    this.frame = 0;
    for (const animation of this.animations) animation.cancel();
    this.animations.clear();
  }

  disconnectedCallback() {
    this.cleanup();
  }
}

if (!customElements.get('personal-timeline')) customElements.define('personal-timeline', PersonalTimeline);
