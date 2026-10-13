import test from 'node:test';import assert from 'node:assert/strict';import {loadCore} from './compile-core.js';
test('Cocos dispatcher blocks same-tick repeated actions and releases on a microtask',async()=>{
 const {createDispatcher}=loadCore('first-pass/dispatch');let s={phase:'reward',count:0},sets=0;
 const dispatch=createDispatcher({getSession:()=>s,setSession:v=>{s=v;sets++},apply:(r,a)=>a.type==='BAD'?r:{...r,count:r.count+1},render:()=>{}});
 dispatch({type:'CHOOSE_REWARD'});dispatch({type:'CHOOSE_REWARD'});assert.equal(s.count,1);assert.equal(sets,1);
 await Promise.resolve();dispatch({type:'BAD'});assert.equal(sets,1);await Promise.resolve();dispatch({type:'CHOOSE_REWARD'});assert.equal(s.count,2);
});
test('Cocos dispatcher releases lock when renderer throws',async()=>{
 const {createDispatcher}=loadCore('first-pass/dispatch');let s={},fail=true;
 const dispatch=createDispatcher({getSession:()=>s,setSession:v=>s=v,apply:r=>r,render:()=>{if(fail)throw Error('render')}});
 assert.throws(()=>dispatch({type:'BAD'}));await Promise.resolve();fail=false;assert.doesNotThrow(()=>dispatch({type:'BAD'}));
});
test('Cocos end-turn guard covers separate rapid input events without blocking card play',async()=>{
 const {createDispatcher}=loadCore('first-pass/dispatch');let now=1000,s={turn:1,plays:0};
 const dispatch=createDispatcher({getSession:()=>s,setSession:v=>s=v,now:()=>now,apply:(r,a)=>a.type==='END_TURN'?{...r,turn:r.turn+1}:{...r,plays:r.plays+1},render:()=>{}});
 dispatch({type:'END_TURN'});await Promise.resolve();now=1050;dispatch({type:'END_TURN'});assert.equal(s.turn,2,'second click must not discard the fresh hand');
 assert.equal(dispatch.canEndTurn(),false);now=1451;dispatch({type:'END_TURN'});assert.equal(s.turn,3);
 await Promise.resolve();now=1470;dispatch({type:'PLAY_CARD',uid:'c1'});await Promise.resolve();assert.equal(s.plays,1);assert.equal(dispatch.canEndTurn(),true);
});
