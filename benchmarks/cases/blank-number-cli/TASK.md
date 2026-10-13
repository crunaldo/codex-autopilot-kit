# Case: strict count parsing

## Objective

Update `src/parse-count.mjs` so `parseCount(value)` accepts only non-negative safe integers supplied as a number or as a plain decimal digit string. Reject blank/whitespace strings, signs, fractions, exponent notation, unsafe integers, non-finite numbers, booleans, and `null` with a `TypeError` or `RangeError`.

## Constraints

- Change only `src/parse-count.mjs`.
- Keep the named export and avoid dependencies.
- Run `npm test`; do not weaken or edit the tests.

## Acceptance

`npm test` passes under Node.js 20 or newer.
