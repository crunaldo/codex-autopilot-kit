export function slugify(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-');
}
