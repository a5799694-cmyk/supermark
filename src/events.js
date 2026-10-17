import {CARDS,createCardInstance} from './cards.js?v=20261017-combat1';
import {shuffle,nextRandom} from './random.js?v=20261017-combat1';

export const EVENT_KINDS=Object.freeze(['cat','work','rest','manual']);
export const EVENT_COPY=Object.freeze({
 cat:{title:'肥猫摆摊',line:'你挑功法，肥猫挑你。',text:'肥猫压着摊布，爪子一伸：旧招换新招，唔包你升职。'},
 work:{title:'梦里补班',line:'日头打工，夜晚做功。',text:'仙人把急单塞进你手里：来都来了，顺便做埋？'},
 rest:{title:'打坐被催',line:'心静自然凉，传音响到慌。',text:'你刚盘腿，传音符就响了。要静音休息，还是边回边练？'},
 manual:{title:'野鸡秘籍',line:'三日飞升，唔包加薪。',text:'路边道人拍着胸口：此书练完，包你出头！你翻开一页，先看清功法再决定。'}
});
export const eventLife=(percent)=>Math.ceil(40*percent/100);
export const eventPool=sectId=>Object.values(CARDS).filter(c=>!c.sect||c.sect===sectId).map(c=>c.id);

export function createAdventure(seed){
 const mixed=shuffle(EVENT_KINDS,(seed^0x85ebca6b)>>>0);
 const a=nextRandom(mixed.seed),b=nextRandom(a.seed);
 let first=Math.floor(a.value*3),second=Math.floor(b.value*3);
 if(first+second===0)second=1;
 if(first+second>3)second=3-first;
 return {plan:[mixed.items.slice(0,first),mixed.items.slice(first,first+second)],gap:0,cursor:0,current:null};
}

// Mutates only a freshly copied run, never the caller's original state.
export function advanceEncounter(run){
 const a=run.adventure,kind=a.plan[a.gap][a.cursor];
 if(!kind){a.current=null;run.stage=a.gap===0?'second-ready':'boss-ready';return;}
 let offers=[];
 if(kind!=='rest'){
  const mixed=shuffle(eventPool(run.sectId),run.seed);run.seed=mixed.seed;
  offers=mixed.items.slice(0,kind==='manual'?1:3);
 }
 a.current={kind,offers,selectedUid:null};run.stage='dream-event';
}

export function canReplace(run,cardId){
 const e=run.adventure?.current,source=run.deck.find(c=>c.uid===e?.selectedUid);
 return Boolean(source&&e.offers.includes(cardId)&&(CARDS[cardId].type==='attack'||run.deck.some(c=>c.uid!==source.uid&&CARDS[c.cardId].type==='attack')));
}

export function resolveEncounter(input,action){
 const event=input.adventure?.current;
 if(input.stage!=='dream-event'||!event||action.type!=='DREAM_EVENT')return input;
 const run=structuredClone(input),e=run.adventure.current;
 const finish=()=>{run.adventure.cursor++;advanceEncounter(run);return run;};
 if(action.choice==='leave')return finish();
 if(e.kind==='cat'){
  if(action.choice==='select'&&run.deck.some(c=>c.uid===action.uid)){e.selectedUid=action.uid;return run;}
  if(action.choice==='cancel'&&e.selectedUid){e.selectedUid=null;return run;}
  if(action.choice==='replace'&&canReplace(input,action.cardId)){
   const index=run.deck.findIndex(c=>c.uid===e.selectedUid);
   run.deck[index]=createCardInstance(action.cardId,`c${run.nextUid++}`);return finish();
  }
 }else if((e.kind==='work'||e.kind==='rest')&&action.choice==='heal'){
  run.hp=Math.min(40,run.hp+eventLife(e.kind==='rest'?20:10));return finish();
 }else if(e.kind==='rest'&&action.choice==='upgrade'){
  const card=run.deck.find(c=>c.uid===action.uid);
  if(card&&!card.upgraded&&CARDS[card.cardId].upgraded){card.upgraded=true;return finish();}
 }else if((e.kind==='work'||e.kind==='manual')&&action.choice==='take'&&e.offers.includes(action.cardId)&&run.hp>eventLife(10)){
  run.hp-=eventLife(10);run.deck.push(createCardInstance(action.cardId,`c${run.nextUid++}`));return finish();
 }
 return input;
}

export function validAdventure(run){
 const a=run.adventure;
 if(a===undefined)return run.stage!=='dream-event'; // Existing v2 keeps its original route.
 const keys=(o,list)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>list.includes(k));
 if(!keys(a,['plan','gap','cursor','current'])||!Array.isArray(a.plan)||a.plan.length!==2||!a.plan.every(g=>Array.isArray(g)&&g.length<=2&&g.every(k=>EVENT_KINDS.includes(k))))return false;
 const all=a.plan.flat();if(all.length<1||all.length>3||new Set(all).size!==all.length)return false;
 if(!Number.isInteger(a.gap)||a.gap<0||a.gap>1||!Number.isInteger(a.cursor)||a.cursor<0||a.cursor>a.plan[a.gap].length)return false;
 if(run.stage!=='dream-event')return a.current===null;
 const e=a.current;
 if(run.sectId==='legacy'||!keys(e,['kind','offers','selectedUid'])||e.kind!==a.plan[a.gap][a.cursor]||!Array.isArray(e.offers))return false;
 if(run.history.length!==a.gap+1||run.history.at(-1)!==(a.gap===0?'first':'second'))return false;
 if(e.offers.length!==(e.kind==='rest'?0:e.kind==='manual'?1:3)||new Set(e.offers).size!==e.offers.length||!e.offers.every(id=>eventPool(run.sectId).includes(id)))return false;
 return e.selectedUid===null||(e.kind==='cat'&&run.deck.some(c=>c.uid===e.selectedUid));
}
