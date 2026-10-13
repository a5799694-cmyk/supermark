import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, applyAction } from '../src/run.js';
import { saveRun, loadRun, clearRun, SAVE_KEY } from '../src/save.js';

const memory=()=>{const data=new Map(); return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),data};};

test('round trips a complete run', () => {
  const storage=memory(); const run=applyAction(createRun(7),{type:'START'});
  assert.equal(saveRun(storage,run),true);
  assert.deepEqual(loadRun(storage),{run,error:null});
  assert.ok(storage.data.has(SAVE_KEY)); assert.equal(clearRun(storage),true);
});

test('rejects malformed or unsafe saves without throwing', () => {
  const storage=memory(); storage.setItem(SAVE_KEY,'{bad');
  assert.equal(loadRun(storage).run,null);
  storage.setItem(SAVE_KEY,JSON.stringify({...createRun(1),version:99})); assert.equal(loadRun(storage).run,null);
  storage.setItem(SAVE_KEY,JSON.stringify({...createRun(1),hp:-1})); assert.equal(loadRun(storage).run,null);
});

test('handles unavailable storage', () => {
  const broken={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
  assert.equal(saveRun(broken,createRun(1)),false); assert.equal(loadRun(broken).run,null); assert.equal(clearRun(broken),false);
});

test('rejects stage-inconsistent and render-crashing battle saves', () => {
  const storage=memory();
  for(const run of [
    {...createRun(1),stage:'battle',battle:null},
    {...createRun(1),rewards:null},
    {...createRun(1),history:null},
    {...createRun(1),nextUid:0}
  ]) { storage.setItem(SAVE_KEY,JSON.stringify(run)); assert.equal(loadRun(storage).run,null); }
});
