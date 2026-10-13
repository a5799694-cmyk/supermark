import {CARDS,createCardInstance} from '../core/cards';
import {SECTS,createStarterDeck} from '../core/sects';
import {createBattle,playCard,endTurn} from '../core/battle';
import {shuffle} from '../core/random';
import {cloneState} from '../core/clone-state';
import {BattleState,CardInstance} from '../core/types';

export type Phase='sect'|'battle'|'reward'|'complete'|'lost';
export interface FirstPassSession {
 phase:Phase;sectId:string|null;deck:CardInstance[];hp:number;battle:BattleState|null;seed:number;rewards:string[];nextUid:number;chosenReward:string|null;
}
export type SessionAction={type:'START';sectId:string}|{type:'PLAY_CARD';uid:string;targetId?:string}|{type:'END_TURN'}|{type:'CHOOSE_REWARD';cardId:string|null}|{type:'RESTART';seed:number};
export function createSession(seed:number=Date.now()):FirstPassSession {
 return {phase:'sect',sectId:null,deck:[],hp:40,battle:null,seed:seed>>>0,rewards:[],nextUid:7,chosenReward:null};
}
function firstRewards(s:FirstPassSession):string[]{
 const sect=SECTS[s.sectId],fixed=sect.core;
 const candidates=Object.values(CARDS).filter(c=>c.sect===s.sectId&&!c.ultimate&&c.id!==fixed&&!sect.starter.includes(c.id)).map(c=>c.id);
 const mixed=shuffle(candidates,s.seed);s.seed=mixed.seed;
 const basic=shuffle(['roll','not-this','breathe'],s.seed);s.seed=basic.seed;
 return [fixed,mixed.items[0],basic.items[0]];
}
export function applySessionAction(input:FirstPassSession,action:SessionAction):FirstPassSession {
 if(action.type==='RESTART'&&(input.phase==='complete'||input.phase==='lost'))return createSession(action.seed);
 if(action.type==='START'&&input.phase==='sect'){
  if(!Object.prototype.hasOwnProperty.call(SECTS,action.sectId))return input;
  const s=cloneState(input);s.sectId=action.sectId;s.deck=createStarterDeck(action.sectId);
  s.battle=createBattle(s.deck,s.hp,['dummy'],s.seed,s.sectId);s.seed=s.battle.seed;s.phase='battle';return s;
 }
 if(input.phase==='reward'&&action.type==='CHOOSE_REWARD'){
  if(action.cardId!==null&&!input.rewards.includes(action.cardId))return input;
  const s=cloneState(input);s.chosenReward=action.cardId;
  if(action.cardId)s.deck.push(createCardInstance(action.cardId,`c${s.nextUid++}`));
  s.rewards=[];s.phase='complete';return s;
 }
 if(input.phase!=='battle')return input;
 let next:BattleState;
 if(action.type==='PLAY_CARD')next=playCard(input.battle,action.uid,action.targetId);
 else if(action.type==='END_TURN')next=endTurn(input.battle);
 else return input;
 if(next===input.battle)return input;
 const s=cloneState(input);s.battle=next;s.seed=next.seed;
 if(next.status==='won'){s.hp=Math.min(40,next.hp+6);s.battle=null;s.rewards=firstRewards(s);s.phase='reward';}
 else if(next.status==='lost'){s.hp=0;s.battle=null;s.phase='lost';}
 return s;
}
