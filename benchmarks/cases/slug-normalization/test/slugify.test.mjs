import assert from 'node:assert/strict';
import test from 'node:test';
import { slugify } from '../src/slugify.mjs';

test('normalizes spaces, accents, and ampersands', () => {
  assert.equal(slugify('Café & docs'), 'cafe-and-docs');
  assert.equal(slugify('  multi   word  '), 'multi-word');
});

test('collapses punctuation and trims separators', () => {
  assert.equal(slugify('Hello, world!'), 'hello-world');
  assert.equal(slugify(' --Ready--- now-- '), 'ready-now');
  assert.equal(slugify('A/B + C'), 'a-b-c');
});
