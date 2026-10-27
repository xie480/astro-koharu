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
const componentUrls = {
  carousel: new URL('../../src/components/ui/cover/HeroCarousel.astro', import.meta.url),
  typewriter: new URL('../../src/components/common/TypewriterText.astro', import.meta.url),
};

class ElementStub extends EventTarget {
  dataset = {};
  attributes = new Map();
  elements = new Map();
  isConnected = true;
  textContent = '';
  disabled = false;
  title = '';
  querySelector(selector) {
    return this.elements.get(selector) ?? null;
  }
  querySelectorAll(selector) {
    return selector === '[data-previous], [data-next]' ? (this.controls ?? []) : [];
  }
  contains(node) {
    return node != null && this.controls?.includes(node);
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  toggleAttribute(name, enabled) {
    if (enabled) this.setAttribute(name, '');
    else this.removeAttribute(name);
  }
}

function button() {
  const element = new ElementStub();
  element.elements.set('span', new ElementStub());
  return element;
}

function deferred() {
  let resolve;
  const promise = new Promise((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

function runtime(kind, { reduced = false } = {}) {
  const source = readFileSync(componentUrls[kind], 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^\s*import .*?from '@lib\/motion-level';\s*/m, '');
  const javascript = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const timers = new Map();
  const subscriptions = new Set();
  const registry = new Map();
  const document = new EventTarget();
  document.hidden = false;
  document.activeElement = null;
  let timerId = 0;
  let motionReduced = reduced;
  const context = vm.createContext({
    HTMLElement: ElementStub,
    AbortController,
    document,
    window: {
      clearTimeout(id) {
        timers.delete(id);
      },
      setTimeout(callback, delay) {
        timers.set(++timerId, { callback, delay });
        return timerId;
      },
    },
    customElements: { get: (name) => registry.get(name), define: (name, value) => registry.set(name, value) },
    readMotionLevel: () => (motionReduced ? 'reduced' : 'lively'),
    subscribeMotionLevel: (callback) => {
      subscriptions.add(callback);
      return () => subscriptions.delete(callback);
    },
  });
  vm.runInContext(javascript, context);
  const element = new (registry.get(kind === 'carousel' ? 'hero-carousel' : 'typewriter-text'))();
  const toggle = button();
  const output = new ElementStub();
  if (kind === 'carousel') {
    element.dataset = { images: JSON.stringify(['/img/first.webp', '/img/second.webp']), interval: '3500', active: '0' };
    const previous = button();
    const next = button();
    element.controls = [previous, next];
    element.elements.set('[data-previous]', previous);
    element.elements.set('[data-next]', next);
    element.elements.set('[data-toggle]', toggle);
    element.elements.set('[data-position]', output);
    for (const index of [0, 1]) element.elements.set(`[data-slide="${index}"]`, { decode: async () => {} });
  } else {
    element.dataset = {
      texts: JSON.stringify(['Alpha', 'Beta']),
      speed: '100',
      deleteSpeed: '20',
      pause: '2000',
      loop: 'true',
      enabled: 'true',
    };
    element.elements.set('[data-typed]', output);
    element.elements.set('[data-typing-toggle]', toggle);
  }
  return {
    element,
    toggle,
    output,
    timers,
    subscriptions,
    motion(value) {
      motionReduced = value;
      for (const callback of subscriptions) callback();
    },
    tick() {
      assert.equal(timers.size, 1);
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
    },
    disconnect() {
      element.isConnected = false;
      element.disconnectedCallback();
    },
    connect() {
      element.isConnected = true;
      element.connectedCallback();
    },
  };
}

test('both Astro components parse without compiler errors', async () => {
  for (const url of Object.values(componentUrls)) {
    const result = await parse(readFileSync(url, 'utf8'), { position: true });
    assert.ok(result.ast);
    assert.equal((result.diagnostics ?? []).filter((item) => item.severity === 1).length, 0);
  }
});

test('a carousel decode completing after disconnect never restarts its timer', async () => {
  const state = runtime('carousel');
  const decode = deferred();
  state.element.elements.get('[data-slide="1"]').decode = () => decode.promise;
  state.connect();
  const pending = state.element.show(1);
  assert.equal(state.element.attributes.get('aria-busy'), 'true');
  state.disconnect();
  decode.resolve();
  await pending;
  assert.equal(state.timers.size, 0);
  assert.equal(state.subscriptions.size, 0);
  assert.equal(state.element.dataset.active, '0');
});

test('an old decode cannot mutate a reconnected carousel or clear its new busy state', async () => {
  const state = runtime('carousel');
  const oldDecode = deferred();
  const newDecode = deferred();
  let calls = 0;
  state.element.elements.get('[data-slide="1"]').decode = () => (++calls === 1 ? oldDecode.promise : newDecode.promise);
  state.connect();
  const oldPending = state.element.show(1);
  state.disconnect();
  state.connect();
  const newPending = state.element.show(1);
  oldDecode.resolve();
  await oldPending;
  assert.equal(state.element.attributes.get('aria-busy'), 'true');
  assert.equal(state.element.dataset.active, '0');
  assert.equal(state.timers.size, 0);
  newDecode.resolve();
  await newPending;
  assert.equal(state.element.attributes.get('aria-busy'), 'false');
  assert.equal(state.element.dataset.active, '1');
  assert.equal(state.output.textContent, '2 / 2');
  assert.equal(state.timers.size, 1);
  state.disconnect();
});

test('reduced motion disables automatic playback but preserves manual carousel controls', async () => {
  const state = runtime('carousel', { reduced: true });
  state.connect();
  assert.equal(state.toggle.disabled, true);
  assert.equal(state.toggle.attributes.get('aria-pressed'), 'true');
  assert.match(state.toggle.title, /减少动效/);
  assert.equal(state.timers.size, 0);
  assert.equal(state.element.controls[1].disabled, false);
  state.element.controls[1].dispatchEvent(new Event('click'));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(state.element.dataset.active, '1');
  assert.equal(state.timers.size, 0);
  state.motion(false);
  assert.equal(state.toggle.disabled, false);
  assert.equal(state.timers.size, 1);
  state.disconnect();
});

test('carousel pause and pointer hover consistently suspend automatic playback', () => {
  const state = runtime('carousel');
  state.connect();
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.timers.size, 0);
  assert.equal(state.toggle.attributes.get('aria-pressed'), 'true');
  state.element.dispatchEvent(new Event('pointerenter'));
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.timers.size, 0);
  state.element.dispatchEvent(new Event('pointerleave'));
  assert.equal(state.timers.size, 1);
  state.disconnect();
});

test('typewriter reduced motion renders complete text with an honest disabled control', () => {
  const state = runtime('typewriter', { reduced: true });
  state.connect();
  assert.equal(state.output.textContent, 'Alpha');
  assert.equal(state.toggle.disabled, true);
  assert.equal(state.toggle.attributes.get('aria-pressed'), 'true');
  assert.equal(state.element.attributes.has('data-still'), true);
  assert.equal(state.timers.size, 0);
  state.motion(false);
  assert.equal(state.toggle.disabled, false);
  assert.equal(state.timers.values().next().value.delay, 2000);
  state.disconnect();
});

test('typewriter pause also stops its cursor and reconnect retains the text position', () => {
  const state = runtime('typewriter');
  state.connect();
  state.tick();
  assert.equal(state.output.textContent, 'A');
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.timers.size, 0);
  assert.equal(state.element.attributes.has('data-still'), true);
  state.toggle.dispatchEvent(new Event('click'));
  assert.equal(state.element.attributes.has('data-still'), false);
  state.disconnect();
  assert.equal(state.subscriptions.size, 0);
  state.connect();
  assert.equal(state.output.textContent, 'A');
  state.tick();
  assert.equal(state.output.textContent, 'Al');
  state.disconnect();
});

test('empty typewriter text has no animation timer and a one-pass sequence ends on its final text', () => {
  const empty = runtime('typewriter');
  empty.element.dataset.texts = '[""]';
  empty.connect();
  assert.equal(empty.timers.size, 0);
  assert.equal(empty.toggle.attributes.has('hidden'), true);
  const state = runtime('typewriter');
  state.element.dataset.texts = '["A","B"]';
  state.element.dataset.loop = 'false';
  state.connect();
  state.tick();
  assert.equal(state.output.textContent, 'A');
  state.tick();
  state.tick();
  assert.equal(state.output.textContent, 'B');
  assert.equal(state.timers.size, 0);
  assert.equal(state.toggle.disabled, true);
  state.disconnect();
});
