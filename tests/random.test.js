import test from 'node:test';
import assert from 'node:assert/strict';
import { nextRandom, shuffle } from '../src/random.js';

test('same seed gives same deterministic sequence and different seeds diverge', () => {
  const sequence = seed => Array.from({length: 5}, () => { const r = nextRandom(seed); seed = r.seed; return r.value; });
  assert.deepEqual(sequence(7), sequence(7));
  assert.notDeepEqual(sequence(7), sequence(8));
});

test('shuffle preserves input and multiset', () => {
  const input = ['a','b','b','c'];
  const result = shuffle(input, 42);
  assert.deepEqual(input, ['a','b','b','c']);
  assert.deepEqual([...result.items].sort(), [...input].sort());
  assert.deepEqual(shuffle([], 1).items, []);
});
