export function calculateRoundScore(isCorrect: boolean, streak: number): number {
  if (!isCorrect) {
    return 0;
  }

  return 100 + Math.max(streak, 0) * 25;
}
