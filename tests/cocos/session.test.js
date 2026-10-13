import test from 'node:test';import assert from 'node:assert/strict';
import {loadCore} from './compile-core.js';import {createRun,applyAction,buildRewards} from '../../src/run.js';
import {SECTS} from '../../src/sects.js';import {cardPreview} from '../../src/card-effects.js';
function win(api,sect,seed){let s=api.applySessionAction(api.createSession(seed),{type:'START',sectId:sect}),moves=0;
 while(s.phase==='battle'&&moves++<100){const c=s.battle.hand.find(c=>cardPreview(s.battle,c).canPlay);s=api.applySessionAction(s,c?{type:'PLAY_CARD',uid:c.uid,targetId:'e0'}:{type:'END_TURN'});}assert.equal(s.phase,'reward');return s;}
test('Cocos Session requires sect and generates the browser first rewards exactly',()=>{
 const api=loadCore('first-pass/session');for(const sect of Object.keys(SECTS))for(const seed of [1,7,42]){
  const start=api.createSession(seed);assert.equal(start.phase,'sect');assert.equal(api.applySessionAction(start,{type:'START',sectId:'bad'}),start);
  const s=win(api,sect,seed),r={...createRun(s.seed),sectId:sect,history:['first'],rewardSeen:[],seed:s.seed};
  // Rewards consume the seed; compare the state just before reward generation.
  const opened=api.applySessionAction(api.createSession(seed),{type:'START',sectId:sect});
  let browser=applyAction(createRun(seed),{type:'START',sectId:sect}),cur=opened;
  while(cur.phase==='battle'){
   const c=cur.battle.hand.find(c=>cardPreview(cur.battle,c).canPlay);const a=c?{type:'PLAY_CARD',uid:c.uid,targetId:'e0'}:{type:'END_TURN'};
   cur=api.applySessionAction(cur,a);browser=applyAction(browser,a);
  }
  assert.deepEqual(cur.rewards,browser.rewards);assert.equal(cur.seed,browser.seed);assert.equal(cur.hp,browser.hp);
  assert.equal(new Set(s.rewards).size,3);assert.ok(s.rewards.includes(SECTS[sect].core));
 }
});
test('Cocos reward ends the first-pass once, skip and restart stay in scope',()=>{
 const api=loadCore('first-pass/session');const s=win(api,'clone',7);
 const taken=api.applySessionAction(s,{type:'CHOOSE_REWARD',cardId:s.rewards[0]});assert.equal(taken.phase,'complete');assert.equal(taken.deck.length,s.deck.length+1);
 assert.equal(api.applySessionAction(taken,{type:'CHOOSE_REWARD',cardId:s.rewards[0]}),taken);
 const skip=api.applySessionAction(s,{type:'CHOOSE_REWARD',cardId:null});assert.equal(skip.phase,'complete');assert.equal(skip.deck.length,s.deck.length);
 assert.equal(api.applySessionAction(skip,{type:'CONTINUE'}),skip);assert.ok(!('adventure' in skip)&&!('souvenir' in skip));
 const restart=api.applySessionAction(taken,{type:'RESTART',seed:42});assert.equal(restart.phase,'sect');assert.equal(restart.battle,null);assert.equal(restart.rewards.length,0);assert.equal(restart.deck.length,0);
});
test('Cocos lost battle restarts and cannot play afterward',()=>{
 const api=loadCore('first-pass/session');let s=api.applySessionAction(api.createSession(1),{type:'START',sectId:'sword'});
 s.battle.hp=1;s.battle.shield=0;s=api.applySessionAction(s,{type:'END_TURN'});assert.equal(s.phase,'lost');assert.equal(s.hp,0);
 assert.equal(api.applySessionAction(s,{type:'END_TURN'}),s);assert.equal(api.applySessionAction(s,{type:'RESTART',seed:9}).phase,'sect');
});
