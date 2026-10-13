# Case: CSV row escaping

## Objective

Update `src/encode-row.mjs` so `encodeRow(cells)` returns one comma-separated row ending in LF. Convert each cell to a string. Quote a cell if it contains a comma, a double quote, CR, or LF; inside a quoted cell, double every double quote.

## Constraints

- Change only `src/encode-row.mjs`.
- Keep the named export and avoid dependencies.
- Run `npm test`; do not weaken or edit the tests.

## Acceptance

`npm test` passes under Node.js 20 or newer.
