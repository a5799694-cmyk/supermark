import test from 'node:test';
import assert from 'node:assert/strict';
import { createDispatcher } from '../src/main.js';

test('dispatch applies, saves, renders, and unlocks on next microtask', async () => {
  let run={n:0}; const order=[];
  const dispatch=createDispatcher({getRun:()=>run,setRun:r=>{run=r},apply:(r)=>({...r,n:r.n+1}),save:()=>order.push('save'),render:()=>order.push('render')});
  dispatch({type:'X'});
  dispatch({type:'X'});
  assert.equal(run.n,1); assert.deepEqual(order,['save','render']); assert.equal(dispatch.isLocked(),true);
  await Promise.resolve(); assert.equal(dispatch.isLocked(),false);
});

test('unchanged state is not saved', async () => {
  const run={n:0}; let saves=0;
  const dispatch=createDispatcher({getRun:()=>run,setRun:()=>{},apply:r=>r,save:()=>saves++,render:()=>{}});
  dispatch({type:'NOOP'}); assert.equal(saves,0);
  await Promise.resolve();
});

test('safeStorage catches a throwing localStorage getter', async () => {
  const { safeStorage } = await import('../src/main.js');
  const fake={get localStorage(){throw new DOMException('blocked','SecurityError')}};
  const result=safeStorage(fake);
  assert.equal(result.storage,null); assert.match(result.error,/本地存储/);
});

test('rapid separate end-turn clicks cannot skip the next hand; card play remains available',async()=>{
 let now=1000,run={turn:1,plays:0},saves=0;
 const dispatch=createDispatcher({getRun:()=>run,setRun:r=>run=r,now:()=>now,apply:(r,a)=>a.type==='END_TURN'?{...r,turn:r.turn+1}:{...r,plays:r.plays+1},save:()=>saves++,render:()=>{}});
 dispatch({type:'END_TURN'});await Promise.resolve();now=1050;dispatch({type:'END_TURN'});
 assert.equal(run.turn,2);assert.equal(saves,1);assert.equal(dispatch.canEndTurn(),false);
 now=1451;dispatch({type:'END_TURN'});assert.equal(run.turn,3);await Promise.resolve();
 dispatch({type:'PLAY_CARD'});await Promise.resolve();assert.equal(run.plays,1);assert.equal(dispatch.canEndTurn(),true);
});
