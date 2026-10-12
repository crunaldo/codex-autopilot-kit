export function encodeRow(cells) {
  return cells.map(String).join(',') + '\n';
}
