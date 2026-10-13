import test from 'node:test';import assert from 'node:assert/strict';import {loadCore} from './compile-core.js';
test('Cocos presentation uses live formulas and leaves state untouched',()=>{
 const {createSession,applySessionAction}=loadCore('first-pass/session'),{presentCard}=loadCore('ui/presentation');
 const s=applySessionAction(createSession(7),{type:'START',sectId:'clone'});s.battle.hp=6;s.battle.clones=3;
 s.battle.hand=[{uid:'u',cardId:'clone-ultimate',upgraded:false}];const before=structuredClone(s),p=presentCard(s,'u');
 assert.equal(p.canPlay,false);assert.equal(p.reason,'生命须大于6');assert.match(p.description,/支付6生命/);assert.match(p.description,/6×3/);assert.equal(p.targetMode,'single');assert.deepEqual(s,before);
 s.battle.hand=[{uid:'u',cardId:'sword-ultimate',upgraded:false}];s.battle.effects.nextAttackDiscount=1;assert.equal(presentCard(s,'u').cost,2);
 s.battle.hand=[{uid:'u',cardId:'thunder-ultimate',upgraded:false}];s.battle.rage=5;assert.equal(presentCard(s,'u').targetMode,'all');assert.match(presentCard(s,'u').description,/全体10伤害/);
});
test('Cocos reference layout stays inside the 360x800 safe frame',()=>{
 const {battleLayout}=loadCore('ui/presentation'),rects=battleLayout();
 for(const [name,r] of Object.entries(rects)){assert.ok(Math.abs(r.x)+r.width/2<=180,name);assert.ok(Math.abs(r.y)+r.height/2<=400,name);}
 const detail=rects.detail,controls=rects.controls,hand=rects.hand,end=rects.end;
 assert.ok(detail.y-detail.height/2>controls.y+controls.height/2);assert.ok(controls.y-controls.height/2>hand.y+hand.height/2);assert.ok(hand.y-hand.height/2>end.y+end.height/2);
});
