import {Node} from 'cc';import {FirstPassSession} from '../first-pass/session';import {CARDS} from '../core/cards';import {describeCard} from './presentation';import {Selection,PanelHandlers} from './SectPanel';import {button,label} from './UiFactory';
export class RewardPanel {
 constructor(private parent:Node){}
 render(session:FirstPassSession,selection:Selection,handlers:PanelHandlers){
  label(this.parent,'RewardHint',`第一战获胜 · 生命 ${session.hp}/40\n选一张功法，或跳过。`,{x:0,y:280,width:328,height:60},18);
  session.rewards.forEach((id,i)=>button(this.parent,'Reward-'+id,`${CARDS[id].name} · ${CARDS[id].cost}灵力\n${describeCard({uid:'preview',cardId:id,upgraded:false})}`,{x:0,y:175-i*155,width:328,height:140},()=>handlers.action({type:'CHOOSE_REWARD',cardId:id}),true,false,18));
  button(this.parent,'SkipReward','唔要，跳过奖励',{x:0,y:-320,width:270,height:52},()=>handlers.action({type:'CHOOSE_REWARD',cardId:null}));
 }
}
