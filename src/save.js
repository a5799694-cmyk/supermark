import { CARDS } from './cards.js?v=20261013';
import { ENEMIES } from './enemies.js?v=20261013';

export const SAVE_KEY='dream-cultivation-v1';
const stages=new Set(['intro','battle','reward','event','second-ready','boss-ready','boss','result']);

function validate(run) {
  if(!run || run.version!==1 || !stages.has(run.stage)) return false;
  if(!Number.isFinite(run.hp)||run.hp<0||run.hp>40||!Array.isArray(run.deck)||!Array.isArray(run.rewards)||!Array.isArray(run.history)||!Number.isSafeInteger(run.nextUid)||run.nextUid<1||!Number.isFinite(run.seed)) return false;
  if(run.rewards.some(id=>!CARDS[id])) return false;
  const needsBattle=run.stage==='battle'||run.stage==='boss'; if(needsBattle!==Boolean(run.battle)) return false;
  const deckCards=[...run.deck]; let battleCards=[];
  if(run.battle) {
    if(!['playing','won','lost'].includes(run.battle.status)||!Number.isFinite(run.battle.hp)||run.battle.hp<0||run.battle.hp>40||!Number.isFinite(run.battle.energy)||run.battle.energy<0||run.battle.energy>3||run.battle.rage<0||run.battle.rage>12||run.battle.clones<0||run.battle.clones>3||!run.battle.effects||!Number.isFinite(run.battle.seed)) return false;
    for(const zone of ['hand','draw','discard','exile']) { if(!Array.isArray(run.battle[zone])) return false; battleCards.push(...run.battle[zone]); }
    if(!Array.isArray(run.battle.enemies)||run.battle.enemies.some(e=>!ENEMIES[e.type]||e.hp<0||!Number.isInteger(e.actionIndex)||e.actionIndex<0)) return false;
  }
  const validCards=cards=>cards.every(c=>c&&CARDS[c.cardId]&&typeof c.uid==='string') && new Set(cards.map(c=>c.uid)).size===cards.length;
  if(!validCards(deckCards)||!validCards(battleCards)) return false;
  return true;
}

export function saveRun(storage,run) { try { storage.setItem(SAVE_KEY,JSON.stringify(run)); return true; } catch { return false; } }
export function loadRun(storage) {
  try { const raw=storage.getItem(SAVE_KEY); if(!raw) return {run:null,error:null}; const run=JSON.parse(raw); return validate(run)?{run,error:null}:{run:null,error:'存档版本或内容无效'}; }
  catch { return {run:null,error:'无法读取本地存档'}; }
}
export function clearRun(storage) { try { storage.removeItem(SAVE_KEY); return true; } catch { return false; } }
