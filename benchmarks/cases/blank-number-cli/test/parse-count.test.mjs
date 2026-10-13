import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCount } from '../src/parse-count.mjs';

test('accepts zero and positive safe integer inputs', () => {
  assert.equal(parseCount(0), 0);
  assert.equal(parseCount(17), 17);
  assert.equal(parseCount('0'), 0);
  assert.equal(parseCount('17'), 17);
  assert.equal(parseCount(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
});

test('rejects values that Number would silently coerce or round', () => {
  for (const value of ['', '   ', '-1', '+1', '1.5', '1e2', '9007199254740992', NaN, Infinity, true, null]) {
    assert.throws(() => parseCount(value), error => error instanceof TypeError || error instanceof RangeError, `expected rejection for ${String(value)}`);
  }
});
