import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, STARTER_IDS, createCardInstance } from '../src/cards.js';

test('defines the nine specified unique cards with valid costs', () => {
  const ids = Object.keys(CARDS);
  assert.equal(ids.length, 9);
  assert.equal(new Set(ids).size, 9);
  assert.ok(Object.values(CARDS).every(card => card.cost >= 0 && card.cost <= 2));
});

test('starter deck contains three attacks, two guards, and one draw card', () => {
  assert.deepEqual(STARTER_IDS, ['roll','roll','roll','not-this','not-this','breathe']);
});

test('creates stable card instances and rejects unknown cards', () => {
  assert.deepEqual(createCardInstance('roll', 'c1'), { uid: 'c1', cardId: 'roll', upgraded: false });
  assert.throws(() => createCardInstance('missing', 'x'), /Unknown card/);
});
