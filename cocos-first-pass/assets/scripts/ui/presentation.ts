import {CARDS} from '../core/cards';
import {cardPreview} from '../core/card-effects';
import {CardInstance,BattleState} from '../core/types';
import {FirstPassSession} from '../first-pass/session';
// Description matches browser view; all dynamic numbers come from cardPreview.
export function describeCard(c:CardInstance,state:BattleState|null=null){
 const d=CARDS[c.cardId],p=cardPreview(state,c);let text='';
 const attack=p.hits>1||d.id==='clone-ultimate'?`${p.damage}×${p.hits}伤害`:`${p.damage}伤害`;
 switch(d.id){
 case 'roll':text=`单体${p.damage}伤害`;break;
 case 'not-this':text=`获得${p.shield}护盾`;break;
 case 'breathe':text=`抽${p.draw}牌，获得1怒气，本场放逐`;break;
 case 'groups':text='增加1分身，抽1牌，上限3';break;
 case 'possess':text=state?(state.clones?`下张攻击追加${state.clones*3}伤害`:'无分身，改抽1牌'):'下张攻击追加分身数×3伤害，无分身则抽1牌';break;
 case 'autoreply':text='单体7伤害，击杀后分身追击；仅剩一敌时获3盾';break;
 case 'signin':text='获得8盾，本回合盾被攻击耗尽获3怒气，仅一次';break;
 case 'overtime':text='获得2怒气，本回合每次受生命伤害再获2怒气';break;
 case 'performance':text=state?`单体${p.damage}伤害，消耗全部怒气`:'单体5＋怒气×2伤害，消耗全部怒气';break;
 case 'triple':text=`单体${attack}`;break;
 case 'free-slash':text='单体3伤害，本场放逐';break;
 case 'draw-slash':text='单体5伤害，抽1牌';break;
 case 'discount':text='本回合下张攻击减1费，本场放逐';break;
 case 'stance':text='获得5盾，下张攻击追加3伤害';break;
 case 'sword-ultimate':text=state?`单体${p.damage}伤害`:'单体12＋本回合此前攻击牌数×3伤害';break;
 case 'thunder-ultimate':text=state?`全体${p.damage}伤害，消耗全部怒气`:'全体5＋怒气伤害，消耗全部怒气';break;
 case 'rage-guard':text='获得5盾和1怒气';break;
 case 'rage-energy':text='耗2怒气，回1灵力、抽1牌，本场放逐';break;
 case 'clone-guard':text=state?`获得${p.shield}护盾`:'获得4＋分身数×2护盾';break;
 case 'clone-ultimate':text=state?`支付6生命，单体${attack}`:'支付6生命，每个分身攻击同一目标6伤害';break;
 case 'clone-energy':text='耗1分身，回1灵力、抽1牌，本场放逐';break;
 }
 if(state&&p.bonus)text+=`；首击额外＋${p.bonus}`;
 return text+'。';
}
export interface CardPresentation {name:string;cost:number;description:string;canPlay:boolean;reason:string;targetMode:'single'|'all'|'none'}
export function presentCard(session:FirstPassSession,uid:string):CardPresentation|null {
 const c=session.battle?.hand.find(c=>c.uid===uid);if(!c)return null;
 const p=cardPreview(session.battle,c);
 return {name:CARDS[c.cardId].name,cost:p.cost,description:describeCard(c,session.battle),canPlay:p.canPlay,reason:p.reason,targetMode:p.targetMode};
}
export function battleLayout(){
 return {
  stats:{x:0,y:295,width:328,height:50},enemy:{x:0,y:190,width:220,height:140},
  hint:{x:0,y:100,width:328,height:30},detail:{x:0,y:5,width:328,height:140},
  controls:{x:0,y:-105,width:328,height:48},hand:{x:0,y:-215,width:328,height:150},end:{x:0,y:-330,width:230,height:52}
 };
}
