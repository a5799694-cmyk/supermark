export function nextRandom(seed) {
  let next = seed >>> 0;
  next ^= next << 13; next ^= next >>> 17; next ^= next << 5;
  next >>>= 0;
  return { seed: next || 0x9e3779b9, value: next / 0x100000000 };
}

export function shuffle(items, seed) {
  const result = [...items];
  let currentSeed = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    const random = nextRandom(currentSeed);
    currentSeed = random.seed;
    const j = Math.floor(random.value * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return { items: result, seed: currentSeed };
}
