import {Node} from 'cc';import {FirstPassSession} from '../first-pass/session';import {CARDS} from '../core/cards';import {describeCard} from './presentation';import {Selection,PanelHandlers} from './SectPanel';import {button,label,box,scroll} from './UiFactory';
export class ResultPanel {
 constructor(private parent:Node){}
 render(session:FirstPassSession,selection:Selection,handlers:PanelHandlers){
  const completed=session.phase==='complete';
  label(this.parent,'Result',completed?`首轮迁移验证完成\n生命 ${session.hp}/40 · ${session.chosenReward?'获得「'+CARDS[session.chosenReward].name+'」':'已跳过奖励'}`:'惨遭炒鱿\n瞓醒再开场。',{x:0,y:270,width:328,height:100},21);
  const content=scroll(this.parent,'Deck',{x:0,y:-20,width:328,height:360},328,session.deck.length*82,false);
  session.deck.forEach((c,i)=>{const row=box(content,'Deck-'+c.uid,{x:164,y:-42-i*82,width:314,height:76});label(row,'Card',`${CARDS[c.cardId].name}\n${describeCard(c)}`,{x:0,y:0,width:298,height:64},14);});
  button(this.parent,'Restart','重新选择门派',{x:0,y:-320,width:270,height:52},()=>handlers.action({type:'RESTART',seed:Date.now()>>>0}));
 }
}
