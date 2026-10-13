export function parseCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new RangeError('Expected a non-negative count.');
  return parsed;
}
