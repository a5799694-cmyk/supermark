// Ported from browser src/card-effects.js; parity-tested; do not tune values here alone.
import {BattleState,CardInstance,CardPreview} from './types';
import {CARDS} from './cards';
export function cardPreview(state:BattleState|null,instance:CardInstance):CardPreview{
 const d=CARDS[instance.cardId];if(!d)return {cost:0,canPlay:false,reason:'未知卡牌',targetMode:'none'};
 const value=k=>instance.upgraded&&d.upgraded?.[k]!==undefined?d.upgraded[k]:d[k]||0;
 const s:BattleState=state||{energy:99,rage:0,clones:0,attacksPlayed:0,effects:{nextAttackCloneBonus:0,nextAttackBonus:0,nextAttackDiscount:0,shieldRage:false,counterRage:false},status:'playing',hp:40,sectId:'legacy',maxHp:40,shield:0,hand:[],draw:[],discard:[],exile:[],enemies:[],turn:1,seed:0,log:[],thunderTriggered:false};
 const attack=d.type==='attack',e=s.effects;
 const cost=Math.max(0,d.cost-(attack?(e.nextAttackDiscount||0):0));
 let damage=value('damage'),hits=d.hits||1,shield=value('shield');
 if(d.id==='performance')damage=5+2*s.rage;
 if(d.id==='sword-ultimate')damage=12+3*(s.attacksPlayed||0);
 if(d.id==='thunder-ultimate')damage=5+s.rage;
 if(d.id==='clone-ultimate')hits=s.clones;
 if(d.id==='clone-guard')shield=4+2*s.clones;
 const bonus=attack?(e.nextAttackCloneBonus||0)+(e.nextAttackBonus||0)+(s.sectId==='sword'&&s.attacksPlayed===2?3:0):0;
 let reason='';if(s.status!=='playing')reason='战斗已结束';else if(s.energy<cost)reason='灵力不足';else if((d.rageCost||0)>s.rage)reason='需要2怒气';else if((d.cloneCost||d.cloneMin||0)>s.clones)reason='需要1分身';else if(d.hpCost&&s.hp<=d.hpCost)reason='生命须大于6';
 return {cost,canPlay:!reason,reason,damage,hits,bonus,shield,hpCost:d.hpCost||0,draw:value('draw'),energyGain:d.energyGain||0,targetMode:d.targetMode||(attack?'single':'none')};
}
