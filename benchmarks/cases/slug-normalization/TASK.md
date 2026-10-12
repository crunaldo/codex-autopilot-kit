# Case: stable ASCII slugs

## Objective

Update `src/slugify.mjs` so `slugify(value)` returns a lowercase ASCII slug. Normalize and remove Latin combining accents, turn ampersands into the word `and`, convert every other run of non-ASCII letters/digits into one hyphen, and trim leading/trailing hyphens.

## Constraints

- Change only `src/slugify.mjs`.
- Keep the named export and avoid dependencies.
- Run `npm test`; do not weaken or edit the tests.

## Acceptance

`npm test` passes under Node.js 20 or newer.
