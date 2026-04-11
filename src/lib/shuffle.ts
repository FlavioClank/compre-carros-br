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
 * Get the current 5-minute window seed (for ad rotation)
 */
export function get5MinSeed(): number {
  return Math.floor(Date.now() / 300000); // 300000ms = 5 minutes
}

/**
 * Get the current 30-minute window seed (for car shuffling)
 */
export function get30MinSeed(): number {
  return Math.floor(Date.now() / 1800000); // 1800000ms = 30 minutes
}

/** @deprecated Use get5MinSeed() instead */
export function getHalfHourSeed(): number {
  return get5MinSeed();
}

/**
 * Calculate milliseconds until the next 5-minute window
 */
export function getMsUntilNextWindow(): number {
  const now = Date.now();
  const windowMs = 300000;
  const nextWindow = Math.ceil(now / windowMs) * windowMs;
  return nextWindow - now;
}

/**
 * Calculate milliseconds until the next 30-minute window
 */
export function getMsUntilNext30MinWindow(): number {
  const now = Date.now();
  const windowMs = 1800000;
  const nextWindow = Math.ceil(now / windowMs) * windowMs;
  return nextWindow - now;
}

/**
 * Rotate array by N positions (shift forward: last becomes first)
 * Used for ad queue rotation every 5 minutes
 */
export function rotateArray<T>(arr: T[], positions: number): T[] {
  if (arr.length === 0) return arr;
  const n = ((positions % arr.length) + arr.length) % arr.length;
  return [...arr.slice(-n), ...arr.slice(0, -n)];
}
