/**
 * Mulberry32 PRNG - deterministic pseudo-random number generator
 * Given the same seed, always produces the same sequence
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle with seeded PRNG
 * Same seed + same array = same output every time
 */
export function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get the current 30-minute window seed
 * Same seed for all users during the same 30-minute window
 */
export function getHalfHourSeed(): number {
  return Math.floor(Date.now() / 1800000); // 1800000ms = 30 minutes
}

/**
 * Calculate milliseconds until the next 30-minute window
 */
export function getMsUntilNextWindow(): number {
  const now = Date.now();
  const windowMs = 1800000;
  const nextWindow = Math.ceil(now / windowMs) * windowMs;
  return nextWindow - now;
}
