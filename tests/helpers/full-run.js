import {createRun,applyAction} from '../../src/run.js';
import {SECTS} from '../../src/sects.js';
import {cardPreview} from '../../src/card-effects.js';
import {saveRun,loadRun} from '../../src/save.js';
import assert from 'node:assert/strict';
export function bestAction(run){
 let best={score:-Infinity,action:{type:'END_TURN'}},seen=new Set(),count=0;
 function score(r){if(r.stage==='result')return r.result==='won'?1e6:-1e6;if(!r.battle)return 10000+r.hp;const b=r.battle;return b.hp*1.4-b.enemies.reduce((sum,e)=>sum+e.hp+e.shield*.4,0)-b.enemies.filter(e=>e.hp>0).length*3+b.rage*.4+b.clones*1.5;}
 function visit(r,first,depth){if(++count>3000)return;if(!r.battle){const value=score(r);if(value>best.score)best={score:value,action:first};return;}
 const key=JSON.stringify(r.battle);if(seen.has(key))return;seen.add(key);
 const end=applyAction(r,{type:'END_TURN'}),value=score(end);if(value>best.score)best={score:value,action:first||{type:'END_TURN'}};
 if(depth>=9)return;
 for(const c of r.battle.hand){const p=cardPreview(r.battle,c);if(!p.canPlay)continue;const targets=p.targetMode==='single'?r.battle.enemies.filter(e=>e.hp>0).map(e=>e.id):[undefined];for(const targetId of targets){const a={type:'PLAY_CARD',uid:c.uid,targetId};const n=applyAction(r,a);if(n!==r)visit(n,first||a,depth+1);}}
 }
 visit(run,null,0);return best.action;
}
export function simulate(sect,seed){let r=applyAction(createRun(seed),{type:'START',sectId:sect}),moves=0;const rows=[];let raw;const storage={setItem:(k,v)=>raw=v,getItem:()=>raw};
 while(r.stage!=='result'&&moves++<200){let a;
 if(r.battle)a=bestAction(r);
 else if(r.stage==='reward')a={type:'CHOOSE_REWARD',cardId:r.history.length===1?SECTS[sect].core:SECTS[sect].ultimate};
 else if(r.stage==='event')a={type:'CHOOSE_EVENT',kind:'upgrade',uid:r.deck.find(c=>c.cardId==='roll').uid};
 else a={type:'CONTINUE'};
 const n=applyAction(r,a);assert.notEqual(n,r,JSON.stringify(a));r=n;saveRun(storage,r);assert.deepEqual(loadRun(storage),{run:r,error:null});
 }
 return {sect,seed,moves,result:r.result,hp:r.hp};
}
