import {CARDS} from './cards.js?v=20261017-art1';
import {ENEMIES} from './enemies.js?v=20261017-art1';
import {SECTS} from './sects.js?v=20261017-art1';
import {validAdventure} from './events.js?v=20261017-art1';
export const SAVE_KEY='dream-cultivation-v1';
const stages=new Set(['intro','battle','reward','event','dream-event','second-ready','boss-ready','boss','result']);
const int=(x,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
const known=(obj,keys)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).every(k=>keys.includes(k));
const validCards=cards=>Array.isArray(cards)&&cards.every(c=>known(c,['uid','cardId','upgraded'])&&CARDS[c.cardId]&&typeof c.uid==='string'&&c.uid.length>0&&typeof c.upgraded==='boolean'&&(!c.upgraded||Boolean(CARDS[c.cardId].upgraded)))&&new Set(cards.map(c=>c.uid)).size===cards.length;
function validate(run,old=false){
 if(!known(run,['version','sectId','rewardSeen','adventure','stage','deck','hp','battle','seed','rewards','route','history','souvenir','result','nextUid'])||run.version!==(old?1:2)||!stages.has(run.stage))return false;
 if(!int(run.hp,0,40)||!int(run.seed,0,0xffffffff)||!int(run.nextUid,1)||!validCards(run.deck)||run.deck.length<5)return false;
 if(run.deck.some(c=>/^c[0-9]+$/.test(c.uid)&&Number(c.uid.slice(1))>=run.nextUid))return false;
 if(!Array.isArray(run.rewards)||run.rewards.some(id=>!CARDS[id])||new Set(run.rewards).size!==run.rewards.length||!Array.isArray(run.history)||run.history.some(k=>!['first','second','boss'].includes(k)))return false;
 if(!validAdventure(run))return false;
 if(![null,'clone','counter'].includes(run.route)||![null,'won','lost'].includes(run.result)||(run.souvenir!==null&&typeof run.souvenir!=='string'))return false;
 if(!old){
  if(![null,'legacy',...Object.keys(SECTS)].includes(run.sectId)||(!run.sectId&&run.stage!=='intro'&&run.stage!=='result'))return false;
  if(!Array.isArray(run.rewardSeen)||run.rewardSeen.some(id=>!CARDS[id]))return false;
 }
 const needsBattle=['battle','boss'].includes(run.stage);if(needsBattle!==Boolean(run.battle))return false;
 if(run.stage==='reward'&&run.rewards.length!==3)return false;
 if(run.stage!=='reward'&&run.rewards.length)return false;
 if(run.battle){const b=run.battle;
  if(!known(b,['sectId','attacksPlayed','thunderTriggered','hp','maxHp','energy','shield','rage','clones','hand','draw','discard','exile','enemies','turn','seed','status','effects','log'])||b.status!=='playing'||b.hp===0||!int(b.hp,0,40)||b.maxHp!==40||!int(b.energy,0,old?3:Number.MAX_SAFE_INTEGER)||!int(b.shield)||!int(b.rage,0,12)||!int(b.clones,0,3)||!int(b.seed,0,0xffffffff)||!int(b.turn,1)||!Array.isArray(b.log)||b.log.some(x=>typeof x!=='string'))return false;
  if(!known(b.effects,['nextAttackCloneBonus','nextAttackBonus','nextAttackDiscount','shieldRage','counterRage'])||!int(b.effects.nextAttackCloneBonus)||typeof b.effects.shieldRage!=='boolean'||typeof b.effects.counterRage!=='boolean')return false;
  if(!old&&(b.sectId!==run.sectId||!int(b.attacksPlayed)||typeof b.thunderTriggered!=='boolean'||!int(b.effects.nextAttackBonus)||!int(b.effects.nextAttackDiscount,0,1)))return false;
  let all=[];for(const zone of ['hand','draw','discard','exile']){if(!validCards(b[zone]))return false;all.push(...b[zone]);}
  if(!validCards(all)||all.length!==run.deck.length)return false;
  if(!all.every(c=>run.deck.some(d=>d.uid===c.uid&&d.cardId===c.cardId&&d.upgraded===c.upgraded)))return false;
  if(!Array.isArray(b.enemies)||!b.enemies.length||b.enemies.some(e=>!known(e,['id','type','name','hp','shield','actionIndex'])||!ENEMIES[e.type]||typeof e.id!=='string'||!int(e.hp,0,ENEMIES[e.type].hp)||!int(e.shield)||!int(e.actionIndex,0,ENEMIES[e.type].actions.length-1)))return false;
  if(!b.enemies.some(e=>e.hp>0))return false;
  if(new Set(b.enemies.map(e=>e.id)).size!==b.enemies.length)return false;
 }
 return true;
}
function migrate(run){
 const r=structuredClone(run);r.version=2;r.sectId='legacy';r.rewardSeen=[];
 if(r.battle){Object.assign(r.battle,{sectId:'legacy',attacksPlayed:0,thunderTriggered:false});Object.assign(r.battle.effects,{nextAttackBonus:0,nextAttackDiscount:0});}
 return r;
}
export function saveRun(storage,run){try{storage.setItem(SAVE_KEY,JSON.stringify(run));return true;}catch{return false;}}
export function loadRun(storage){try{const raw=storage.getItem(SAVE_KEY);if(!raw)return {run:null,error:null};const run=JSON.parse(raw);if(run?.version===1){if(!validate(run,true))return {run:null,error:'存档版本或内容无效'};return {run:migrate(run),error:null};}return validate(run)?{run,error:null}:{run:null,error:'存档版本或内容无效'};}catch{return {run:null,error:'无法读取本地存档'};}}
export function clearRun(storage){try{storage.removeItem(SAVE_KEY);return true;}catch{return false;}}
