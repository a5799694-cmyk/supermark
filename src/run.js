import { STARTER_IDS, CARDS, createCardInstance } from './cards.js?v=20261013-events1';
import { createBattle, playCard, endTurn } from './battle.js?v=20261013-events1';
import {SECTS,createStarterDeck} from './sects.js?v=20261013-events1';
import { shuffle } from './random.js?v=20261013-events1';
import {createAdventure,advanceEncounter,resolveEncounter} from './events.js?v=20261013-events1';

const makeDeck=()=>STARTER_IDS.map((id,i)=>createCardInstance(id,`c${i+1}`));
const copy=value=>structuredClone(value);

export function createRun(seed=Date.now(),profile={}) {
  return {version:2,sectId:null,rewardSeen:[],adventure:createAdventure(seed),stage:'intro',deck:makeDeck(),hp:40,battle:null,seed:seed>>>0,rewards:[],route:null,history:[],souvenir:profile.souvenir||null,result:null,nextUid:7};
}

function beginBattle(run,kind) {
  const enemyIds=kind==='first'?['dummy']:kind==='second'?['dummy','dummy-shield']:['boss'];
  run.battle=createBattle(run.deck,run.hp,enemyIds,run.seed,run.sectId); run.seed=run.battle.seed; run.stage=kind==='boss'?'boss':'battle'; run.history.push(kind);
}

export function buildRewards(run) {
  const battleCount=run.history.filter(x=>['first','second','boss'].includes(x)).length;
  if(SECTS[run.sectId]){
    const sect=SECTS[run.sectId],seen=run.rewardSeen||[];
    const fixed=battleCount===1?sect.core:sect.ultimate;
    let candidates=battleCount===1?Object.values(CARDS).filter(c=>c.sect===run.sectId&&!c.ultimate&&c.id!==fixed&&!sect.starter.includes(c.id)).map(c=>c.id):sect.synergy.filter(id=>!seen.includes(id));
    if(!candidates.length)candidates=Object.values(CARDS).filter(c=>c.sect===run.sectId&&c.id!==fixed&&!seen.includes(c.id)).map(c=>c.id);
    const mixed=shuffle(candidates,run.seed);run.seed=mixed.seed;
    const basic=shuffle(['roll','not-this','breathe'],run.seed);run.seed=basic.seed;
    const choices=[fixed,mixed.items[0],basic.items[0]];run.rewardSeen=[...new Set([...seen,...choices])];return choices;
  }
  if(battleCount===1) {
    const basics=shuffle(['roll','not-this','breathe'],run.seed); run.seed=basics.seed;
    return ['groups','signin',basics.items[0]];
  }
  if(!run.route) {
    const all=shuffle(['groups','possess','autoreply','signin','overtime','performance'],run.seed); run.seed=all.seed;
    return all.items.slice(0,3);
  }
  const own=run.route==='clone'?['possess','autoreply']:['overtime','performance'];
  const other=run.route==='clone'?['overtime','performance']:['possess','autoreply'];
  const mixed=shuffle(other,run.seed); run.seed=mixed.seed; return [...own,mixed.items[0]];
}

function afterBattle(run) {
  run.hp=Math.min(40,run.battle.hp+6); run.seed=run.battle.seed; run.battle=null;
  const battleCount=run.history.filter(x=>['first','second','boss'].includes(x)).length;
  if(battleCount===3) { run.stage='result'; run.result='won'; run.souvenir='自愿放弃飞升补偿确认书'; }
  else { run.stage='reward'; run.rewards=buildRewards(run); }
}

export function applyAction(input,action) {
  if(input.stage==='dream-event')return resolveEncounter(input,action);
  if(action.type==='RESTART' && input.stage==='result') return createRun(action.seed,{souvenir:input.souvenir});
  const run=copy(input);
  if(action.type==='START' && input.stage==='intro') {
    if(input.sectId!=='legacy'){if(!SECTS[action.sectId])return input;run.sectId=action.sectId;run.deck=createStarterDeck(action.sectId);}
    beginBattle(run,'first');return run;
  }
  if((input.stage==='battle'||input.stage==='boss') && action.type==='PLAY_CARD') {const next=playCard(input.battle,action.uid,action.targetId);if(next===input.battle)return input;run.battle=next;}
  else if((input.stage==='battle'||input.stage==='boss') && action.type==='END_TURN') {const next=endTurn(input.battle);if(next===input.battle)return input;run.battle=next;}
  else if(input.stage==='reward' && action.type==='CHOOSE_REWARD') {
    if(action.cardId!==null && !run.rewards.includes(action.cardId)) return input;
    if(action.cardId) { run.deck.push(createCardInstance(action.cardId,`c${run.nextUid++}`)); if(!run.route) run.route=CARDS[action.cardId].route||null; }
    run.rewards=[]; const wins=run.history.filter(x=>['first','second'].includes(x)).length;
    if(run.adventure&&run.sectId!=='legacy'){
      run.adventure.gap=wins-1;run.adventure.cursor=0;advanceEncounter(run);
    }else run.stage=wins===1?'event':'boss-ready'; return run;
  } else if(input.stage==='event' && action.type==='CHOOSE_EVENT') {
    const index=run.deck.findIndex(c=>c.uid===action.uid); if(index<0) return input;
    if(action.kind==='delete') { if(run.deck.length<=5) return input; const remaining=run.deck.filter((_,i)=>i!==index); if(!remaining.some(c=>CARDS[c.cardId].type==='attack')) return input; run.deck=remaining; }
    else if(action.kind==='upgrade') { const card=run.deck[index]; if(card.upgraded||!CARDS[card.cardId].upgraded) return input; card.upgraded=true; }
    else return input;
    run.stage='second-ready'; return run;
  } else if(action.type==='CONTINUE' && input.stage==='second-ready') { beginBattle(run,'second'); return run; }
  else if(action.type==='CONTINUE' && input.stage==='boss-ready') { beginBattle(run,'boss'); return run; }
  else return input;
  if(run.battle.status==='won') afterBattle(run);
  else if(run.battle.status==='lost') { run.stage='result'; run.result='lost'; run.battle=null; }
  return run;
}
