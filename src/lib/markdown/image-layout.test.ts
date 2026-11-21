import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('文章图片包装器应占满正文宽度并保留竖图收缩规则', async () => {
  const stylesheetPath = fileURLToPath(new URL('../../styles/theme/markdown.css', import.meta.url));
  const stylesheet = await readFile(stylesheetPath, 'utf8');
  const wrapperRule = stylesheet.match(/\.prose \.markdown-image-wrapper\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const portraitRule = stylesheet.match(/\.prose \.markdown-image-wrapper\.portrait\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(wrapperRule, /\bwidth:\s*100%/);
  assert.match(portraitRule, /\bwidth:\s*fit-content/);
});
