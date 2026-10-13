import test from 'node:test';
import assert from 'node:assert/strict';
import { createCardInstance } from '../src/cards.js';
import { createBattle, playCard, endTurn } from '../src/battle.js';

const deck = ids => ids.map((id,i) => createCardInstance(id, `c${i}`));

test('creates battle with correct resources and four cards', () => {
  const state = createBattle(deck(['roll','roll','roll','not-this','not-this','breathe']), 40, ['dummy'], 1);
  assert.equal(state.hp, 40); assert.equal(state.energy, 3); assert.equal(state.hand.length, 4);
});

test('illegal actions preserve the same state object', () => {
  const state = createBattle(deck(['roll','roll','roll','not-this','not-this','breathe']), 40, ['dummy'], 2);
  assert.equal(playCard({...state, energy:0}, state.hand[0].uid, state.enemies[0].id).energy, 0);
  assert.equal(playCard(state, 'missing'), state);
});

test('damage hits shield first and turn resets player shield', () => {
  let state = createBattle(deck(['roll','roll','roll','not-this','not-this','breathe']), 40, ['dummy'], 3);
  state = {...state, hand:[createCardInstance('roll','r')], enemies:[{...state.enemies[0], shield:4}]};
  state = playCard(state, 'r', state.enemies[0].id);
  assert.equal(state.enemies[0].hp, 14); assert.equal(state.enemies[0].shield, 0);
  assert.equal(endTurn({...state, shield:5}).shield, 0);
});

test('clone bonus and rage finisher resolve once', () => {
  let state = createBattle(deck(['possess','roll','performance','roll','roll','roll']), 40, ['boss'], 4);
  state = {...state, clones:2, hand:[createCardInstance('possess','p'),createCardInstance('roll','r')], energy:3};
  state = playCard(state,'p'); state = playCard(state,'r',state.enemies[0].id);
  assert.equal(state.enemies[0].hp, 34); assert.equal(state.effects.nextAttackCloneBonus, 0);
  state = {...state, rage:10, hand:[createCardInstance('performance','f')], energy:2};
  state = playCard(state,'f',state.enemies[0].id);
  assert.equal(state.rage,0); assert.equal(state.enemies[0].hp,9);
});

test('clone bonus applies to every manual attack and is consumed once', () => {
  for (const [cardId,base] of [['autoreply',7],['performance',5]]) {
    let state=createBattle(deck(['possess',cardId,'roll','roll','roll','roll']),40,['boss'],9);
    state={...state,clones:2,hand:[createCardInstance('possess','p'),createCardInstance(cardId,'a')],energy:3,rage:0};
    state=playCard(state,'p'); state=playCard(state,'a',state.enemies[0].id);
    assert.equal(state.enemies[0].hp,46-base-6); assert.equal(state.effects.nextAttackCloneBonus,0);
  }
});

test('caps rage and clones and stops after victory', () => {
  let state = createBattle(deck(['groups','groups','groups','groups','overtime','roll']), 40, ['dummy'], 5);
  state = {...state, clones:3, rage:11, hand:[createCardInstance('groups','g'),createCardInstance('overtime','o')], energy:3};
  state = playCard(state,'g'); state = playCard(state,'o');
  assert.equal(state.clones,3); assert.equal(state.rage,12);
  const doomed = {...state, enemies:[{...state.enemies[0], hp:1, shield:0}], hand:[createCardInstance('roll','z')], energy:1};
  const won = playCard(doomed,'z',doomed.enemies[0].id);
  assert.equal(won.status,'won'); assert.equal(endTurn(won),won);
});
