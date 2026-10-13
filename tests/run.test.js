import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, applyAction, buildRewards } from '../src/run.js';

const legacyRun=(seed)=>({...createRun(seed),sectId:'legacy'});

test('starts the fixed dream route and first battle', () => {
  let run=legacyRun(7); assert.equal(run.stage,'intro');
  run=applyAction(run,{type:'START'});
  assert.equal(run.stage,'battle'); assert.equal(run.battle.enemies.length,1); assert.equal(run.battle.enemies[0].hp,16);
});

test('first reward guarantees both route starters and cannot be claimed twice', () => {
  let run=legacyRun(2); run={...run,stage:'reward',rewards:['groups','signin','roll'],history:['first']};
  const picked=applyAction(run,{type:'CHOOSE_REWARD',cardId:'groups'});
  assert.equal(picked.deck.length,7); assert.equal(picked.route,'clone'); assert.equal(picked.stage,'event');
  assert.equal(applyAction(picked,{type:'CHOOSE_REWARD',cardId:'groups'}),picked);
});

test('event deletion preserves five cards and an attack', () => {
  let run=legacyRun(3); run={...run,stage:'event'};
  const roll=run.deck.find(c=>c.cardId==='roll');
  const deleted=applyAction(run,{type:'CHOOSE_EVENT',kind:'delete',uid:roll.uid});
  assert.equal(deleted.deck.length,5); assert.ok(deleted.deck.some(c=>c.cardId==='roll'));
  const again=applyAction(deleted,{type:'CHOOSE_EVENT',kind:'delete',uid:deleted.deck[0].uid});
  assert.equal(again,deleted);
});

test('invalid phase action preserves identity and restart clears old state', () => {
  const run=legacyRun(4);
  assert.equal(applyAction(run,{type:'END_TURN'}),run);
  const restarted=applyAction({...run,stage:'result',result:'lost'},{type:'RESTART',seed:9});
  assert.equal(restarted.stage,'intro'); assert.equal(restarted.seed,9); assert.equal(restarted.deck.length,6);
});

test('skipping first reward gives three distinct reward cards at second reward', () => {
  const run={...legacyRun(11),history:['first','second'],route:null};
  const rewards=buildRewards(run);
  assert.equal(rewards.length,3); assert.equal(new Set(rewards).size,3);
  assert.ok(rewards.every(id=>['groups','possess','autoreply','signin','overtime','performance'].includes(id)));
});

test('restart keeps earned souvenir', () => {
  const run={...legacyRun(1),stage:'result',result:'won',souvenir:'自愿放弃飞升补偿确认书'};
  assert.equal(applyAction(run,{type:'RESTART',seed:2}).souvenir,'自愿放弃飞升补偿确认书');
});
