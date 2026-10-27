import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const { parse } = await import(pathToFileURL(astroRequire.resolve('@astrojs/compiler')).href);
const source = readFileSync(new URL('../../src/components/layout/Footer.astro', import.meta.url), 'utf8');

class ElementStub extends EventTarget {
  attributes = new Map();
  elements = new Map();
  isConnected = true;
  disabled = false;
  title = '';
  textContent = '';
  querySelector(selector) {
    return this.elements.get(selector) ?? null;
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  toggleAttribute(name, value) {
    if (value) this.setAttribute(name, '');
    else this.removeAttribute(name);
  }
}

function runtime({ reduced = false, hasObserver = true } = {}) {
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*import .*?from '@lib\/motion-level';\s*/m, '');
  const javascript = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const registry = new Map();
  const subscriptions = new Set();
  const observers = [];
  const document = new EventTarget();
  document.hidden = false;
  let motionReduced = reduced;
  class ObserverStub {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(target) {
      this.target = target;
    }
    disconnect() {
      this.disconnected = true;
    }
    deliver(inView) {
      this.callback([{ isIntersecting: inView }]);
    }
  }
  vm.runInNewContext(javascript, {
    HTMLElement: ElementStub,
    AbortController,
    document,
    ...(hasObserver ? { IntersectionObserver: ObserverStub } : {}),
    customElements: { get: (name) => registry.get(name), define: (name, value) => registry.set(name, value) },
    readMotionLevel: () => (motionReduced ? 'reduced' : 'lively'),
    subscribeMotionLevel(callback) {
      subscriptions.add(callback);
      return () => subscriptions.delete(callback);
    },
  });
  const element = new (registry.get('animated-footer'))();
  const toggle = new ElementStub();
  toggle.setAttribute('hidden', '');
  toggle.elements.set('span', new ElementStub());
  element.elements.set('[data-footer-toggle]', toggle);
  return {
    element,
    toggle,
    observers,
    subscriptions,
    get playing() {
      return element.attributes.has('data-playing');
    },
    connect() {
      element.isConnected = true;
      element.connectedCallback();
    },
    disconnect() {
      element.isConnected = false;
      element.disconnectedCallback();
    },
    visibility(hidden) {
      document.hidden = hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    },
    swap() {
      document.dispatchEvent(new Event('astro:before-swap'));
    },
    motion(value) {
      motionReduced = value;
      for (const callback of subscriptions) callback();
    },
  };
}

test('footer Astro markup parses without compiler errors', async () => {
  const result = await parse(source, { position: true });
  assert.ok(result.ast);
  assert.equal((result.diagnostics ?? []).filter((item) => item.severity === 1).length, 0);
});

test('decorative footer motion runs only while visible in both the viewport and document', () => {
  const state = runtime();
  state.connect();
  assert.equal(state.playing, false);
  assert.equal(state.toggle.attributes.has('hidden'), false);
  state.observers[0].deliver(true);
  assert.equal(state.playing, true);
  state.observers[0].deliver(false);
  assert.equal(state.playing, false);
  state.observers[0].deliver(true);
  state.visibility(true);
  assert.equal(state.playing, false);
  state.visibility(false);
  assert.equal(state.playing, true);
  state.disconnect();
});

test('manual pause survives visibility changes, reduced motion and reconnect without duplicate controls', () => {
  const state = runtime();
  state.connect();
  state.observers[0].deliver(true);
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.playing, false);
  assert.equal(state.toggle.attributes.get('aria-pressed'), 'true');
  assert.match(state.toggle.attributes.get('aria-label'), /继续/);
  state.visibility(true);
  state.visibility(false);
  state.motion(true);
  assert.equal(state.toggle.disabled, true);
  state.motion(false);
  assert.equal(state.toggle.disabled, false);
  assert.equal(state.playing, false);
  state.disconnect();
  state.connect();
  state.observers[1].deliver(true);
  assert.equal(state.playing, false);
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.playing, true);
  assert.equal(state.subscriptions.size, 1);
  state.disconnect();
});

test('reduced motion prevents playback and disables its toggle until the preference changes', () => {
  const state = runtime({ reduced: true });
  state.connect();
  state.observers[0].deliver(true);
  assert.equal(state.playing, false);
  assert.equal(state.element.attributes.has('data-reduced'), true);
  assert.equal(state.toggle.disabled, true);
  assert.match(state.toggle.title, /减少动效/);
  state.motion(false);
  assert.equal(state.element.attributes.has('data-reduced'), false);
  assert.equal(state.toggle.disabled, false);
  assert.equal(state.playing, true);
  state.disconnect();
});

test('Astro page swaps release observers and subscriptions and ignore stale callbacks', () => {
  const state = runtime();
  state.connect();
  state.observers[0].deliver(true);
  state.swap();
  assert.equal(state.playing, false);
  assert.equal(state.observers[0].disconnected, true);
  assert.equal(state.subscriptions.size, 0);
  state.observers[0].deliver(true);
  state.toggle.dispatchEvent(new Event('click'));
  state.visibility(false);
  assert.equal(state.playing, false);
  state.connect();
  state.observers[1].deliver(true);
  assert.equal(state.playing, true);
  assert.equal(state.subscriptions.size, 1);
  state.disconnect();
});

test('lack of IntersectionObserver keeps the static message usable with a working pause control', () => {
  const state = runtime({ hasObserver: false });
  state.connect();
  assert.equal(state.playing, true);
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.playing, false);
  state.disconnect();
  assert.equal(state.subscriptions.size, 0);
});
