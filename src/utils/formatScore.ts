export function formatScore(score: number): string {
  return new Intl.NumberFormat('en-US').format(score);
}
