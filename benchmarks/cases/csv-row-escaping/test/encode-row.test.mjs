import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeRow } from '../src/encode-row.mjs';

test('writes simple and empty cells with a final LF', () => {
  assert.equal(encodeRow(['alpha', 'plain', '']), 'alpha,plain,\n');
  assert.equal(encodeRow([]), '\n');
});

test('quotes delimiters, quotes, and line breaks', () => {
  assert.equal(encodeRow(['a,b', 'He said "go"', 'line1\nline2', 'carriage\rreturn']), '"a,b","He said ""go""","line1\nline2","carriage\rreturn"\n');
});
