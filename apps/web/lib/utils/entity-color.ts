// Deterministic color assignment for open-ended entities (organizations,
// reviewers) so the same organization/reviewer always renders in the same
// color everywhere it appears (badges, dashboard charts, tables) — unlike an
// index-based palette, which reshuffles colors whenever sort order changes.
const PALETTE = [
  "#00453A", // pine
  "#00856F", // emerald
  "#B78A3D", // gold
  "#4FB39E", // teal
  "#8A6425", // bronze
  "#7C5295", // plum
  "#2E6E9E", // slate blue
  "#A0522D", // sienna
];

function hash(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getColorForKey(key: string) {
  return PALETTE[hash(key) % PALETTE.length];
}
