import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,applyAction} from '../src/run.js';
import {CARDS} from '../src/cards.js';
import {saveRun,loadRun} from '../src/save.js';
import {render} from '../src/view.js';

const memory=()=>{let raw;return {setItem:(k,v)=>raw=v,getItem:()=>raw};};
function eventRun(kind,sect='sword',hp=20){
 const r=applyAction(createRun(7),{type:'START',sectId:sect});
 r.battle=null;r.hp=hp;r.stage='reward';r.history=['first'];r.rewards=['roll','not-this','breathe'];
 r.adventure={plan:[[kind],[]],gap:0,cursor:0,current:null};
 return applyAction(r,{type:'CHOOSE_REWARD',cardId:null});
}
const choose=(r,choice,extra={})=>applyAction(r,{type:'DREAM_EVENT',choice,...extra});

test('new adventures plan 1–3 unique encounters with 0–2 per gap deterministically',()=>{
 const plans=new Set();let withoutCat=false,catInSecond=false;
 for(let seed=0;seed<150;seed++){
  const r=createRun(seed),p=r.adventure?.plan;
  assert.ok(p,'new run needs a saved adventure plan');
  assert.deepEqual(p,createRun(seed).adventure.plan);
  assert.equal(p.length,2);assert.ok(p.every(g=>g.length<=2));
  assert.ok(p.flat().length>=1&&p.flat().length<=3);
  assert.equal(new Set(p.flat()).size,p.flat().length);
  plans.add(JSON.stringify(p));withoutCat ||= !p.flat().includes('cat');catInSecond ||= p[1].includes('cat');
 }
 assert.ok(plans.size>8);assert.ok(withoutCat&&catInSecond);
});
test('cat exchange selection and cancellation preserve offers; replacement resolves once',()=>{
 let r=eventRun('cat');assert.equal(r.stage,'dream-event');const cards=r.deck.length,offers=r.adventure.current.offers;
 assert.equal(new Set(offers).size,3);assert.ok(offers.every(id=>!CARDS[id].sect||CARDS[id].sect==='sword'));
 assert.equal(choose(r,'replace',{uid:r.deck[0].uid,cardId:offers[0]}),r,'must select a source first');
 r=choose(r,'select',{uid:r.deck[0].uid});const s=memory();saveRun(s,r);assert.deepEqual(loadRun(s).run,r);
 r=choose(r,'cancel');assert.deepEqual(r.adventure.current.offers,offers);assert.equal(r.deck.length,cards);
 const uid=r.deck[0].uid;r=choose(r,'select',{uid});r=choose(r,'replace',{cardId:offers[0]});
 assert.equal(r.stage,'second-ready');assert.equal(r.deck.length,cards);assert.equal(r.deck[0].cardId,offers[0]);
 assert.equal(choose(r,'replace',{cardId:offers[0]}),r);
});
test('cat cannot replace the last attack with a skill',()=>{
 let r=eventRun('cat');r.deck=r.deck.map((c,i)=>({...c,cardId:i===0?'roll':'not-this'}));
 r.adventure.current.offers=['breathe','roll','stance'];r=choose(r,'select',{uid:r.deck[0].uid});
 assert.equal(choose(r,'replace',{cardId:'breathe'}),r);
 assert.equal(choose(r,'replace',{cardId:'roll'}).stage,'second-ready');
});
test('work pays four life only on choosing an offered card and heal caps at 40',()=>{
 const r=eventRun('work');assert.equal(choose(r,'take',{cardId:'bad'}),r);
 const taken=choose(r,'take',{cardId:r.adventure.current.offers[0]});assert.equal(taken.hp,16);assert.equal(taken.deck.length,r.deck.length+1);
 const low=eventRun('work','sword',4);assert.equal(choose(low,'take',{cardId:low.adventure.current.offers[0]}),low);
 assert.equal(choose(eventRun('work','sword',39),'heal').hp,40);
});
test('rest heals eight or upgrades one eligible card; manuscript shows one known offer',()=>{
 assert.equal(choose(eventRun('rest'),'heal').hp,28);
 let r=eventRun('rest');const c=r.deck.find(c=>CARDS[c.cardId].upgraded);r=choose(r,'upgrade',{uid:c.uid});assert.equal(r.deck.find(x=>x.uid===c.uid).upgraded,true);
 const m=eventRun('manual');assert.equal(m.adventure.current.offers.length,1);
 assert.equal(choose(m,'take',{cardId:'bad'}),m);assert.equal(choose(m,'take',{cardId:m.adventure.current.offers[0]}).hp,16);
});
test('skip advances through the planned gap and second gap ends at boss-ready',()=>{
 let r=eventRun('cat');r.adventure.plan=[['cat','rest'],['manual']];
 r=choose(r,'leave');assert.equal(r.adventure.current.kind,'rest');r=choose(r,'leave');assert.equal(r.stage,'second-ready');
 r={...r,stage:'reward',history:['first','second'],rewards:['roll','not-this','breathe']};
 r=applyAction(r,{type:'CHOOSE_REWARD',cardId:null});assert.equal(r.adventure.current.kind,'manual');
 assert.equal(choose(r,'leave').stage,'boss-ready');
});
test('empty first gap continues directly, offers survive reload and effects do not mutate input',()=>{
 let r=applyAction(createRun(12),{type:'START',sectId:'thunder'});
 r.battle=null;r.stage='reward';r.history=['first'];r.rewards=['roll','not-this','breathe'];
 r.adventure={plan:[[],['work']],gap:0,cursor:0,current:null};
 r=applyAction(r,{type:'CHOOSE_REWARD',cardId:null});assert.equal(r.stage,'second-ready');
 r=applyAction(r,{type:'CONTINUE'});assert.equal(r.history.at(-1),'second');assert.equal(r.battle.sectId,'thunder');
 const e=eventRun('work','thunder'),before=structuredClone(e),s=memory();saveRun(s,e);
 const restored=loadRun(s).run;const action={type:'DREAM_EVENT',choice:'take',cardId:e.adventure.current.offers[0]};
 const changed=applyAction(e,action);assert.deepEqual(e,before);assert.deepEqual(changed,applyAction(restored,action));
 const next=applyAction(changed,{type:'CONTINUE'});assert.equal(next.battle.hp,changed.hp);assert.ok(next.battle.hand.concat(next.battle.draw).some(c=>c.uid===changed.deck.at(-1).uid));
});
test('old v2 saves preserve the fixed route, malformed event saves fail without overwrite',()=>{
 const s=memory();let r=eventRun('cat');saveRun(s,r);assert.deepEqual(loadRun(s).run,r);
 for(const mutate of [x=>x.adventure.plan=[['cat','cat'],[]],x=>x.adventure.current.offers=['bad'],x=>x.adventure.current.selectedUid='missing',x=>x.adventure.cursor=9,x=>x.adventure.current.kind='rest']){
  const bad=structuredClone(r);mutate(bad);saveRun(s,bad);const raw=s.getItem();assert.equal(loadRun(s).run,null);assert.equal(s.getItem(),raw);
 }
 const old=applyAction(createRun(3),{type:'START',sectId:'sword'});delete old.adventure;saveRun(s,old);
 const loaded=loadRun(s).run;assert.ok(loaded);loaded.stage='reward';loaded.battle=null;loaded.history=['first'];loaded.rewards=['roll','not-this','breathe'];
 assert.equal(applyAction(loaded,{type:'CHOOSE_REWARD',cardId:null}).stage,'event');
});
test('event UI displays real payment, full card effects, cancel and leave controls',()=>{
 const root={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null};
 let r=eventRun('manual','sword',4);render(root,r,{},()=>{});assert.match(root.innerHTML,/野鸡秘籍/);assert.match(root.innerHTML,/支付4生命/);assert.match(root.innerHTML,/至少剩1/);assert.match(root.innerHTML,/disabled/);assert.match(root.innerHTML,/离开/);
 r=eventRun('cat');r=choose(r,'select',{uid:r.deck[0].uid});render(root,r,{},()=>{});assert.match(root.innerHTML,/取消/);assert.match(root.innerHTML,/强化不会保留/);assert.match(root.innerHTML,/灵力/);
});
