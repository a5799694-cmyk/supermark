import {Node} from 'cc';import {FirstPassSession} from '../first-pass/session';import {ENEMIES} from '../core/enemies';import {SECTS} from '../core/sects';
import {Selection,PanelHandlers} from './SectPanel';import {presentCard,battleLayout} from './presentation';import {button,label,box,scroll} from './UiFactory';
export class BattlePanel {
 constructor(private parent:Node){}
 render(session:FirstPassSession,selection:Selection,handlers:PanelHandlers){
  const b=session.battle,rect=battleLayout(),p=selection.selectedUid?presentCard(session,selection.selectedUid):null;
  label(this.parent,'Stats',`第${b.turn}回合 · 灵力 ${b.energy}/基础3\n命 ${b.hp}/40 · 盾 ${b.shield} · 怒 ${b.rage}/12 · 分身 ${b.clones}/3`,rect.stats,17);
  for(const e of b.enemies){const a=ENEMIES[e.type].actions[e.actionIndex],intent=a.type==='shield'?`蓄盾 ${a.value}`:a.type==='multi'?`攻击 ${a.value}×${a.hits}`:`攻击 ${a.value}`;
   button(this.parent,'Enemy-'+e.id,`${e.name}\n${intent}\n命 ${e.hp} · 盾 ${e.shield}`,rect.enemy,()=>handlers.action({type:'PLAY_CARD',uid:selection.selectedUid,targetId:e.id}),Boolean(p?.canPlay&&p.targetMode==='single'&&e.hp>0),false,21);
  }
  label(this.parent,'Hint',p?(p.canPlay?(p.targetMode==='single'?'点击上方敌人，确认攻击':'点击下方确认打出'):p.reason):'点手牌查看详情；拖动手牌可左右翻看',rect.hint,13);
  const detail=box(this.parent,'Detail',rect.detail);
  const text=p?`${p.name} · ${p.cost}灵力\n${p.description}${p.canPlay?'':'\n'+p.reason}`:`${SECTS[session.sectId].passive}\n选择手牌查看完整效果。\n单体攻击点敌人，技能点确认。`;
  label(detail,'Description',text,{x:0,y:0,width:306,height:122},17);
  button(this.parent,'ConfirmCard','确认打出',{x:-85,y:rect.controls.y,width:158,height:48},()=>handlers.action({type:'PLAY_CARD',uid:selection.selectedUid}),Boolean(p?.canPlay&&p.targetMode!=='single'));
  button(this.parent,'CancelCard','取消选牌',{x:85,y:rect.controls.y,width:158,height:48},()=>handlers.selectCard(null),Boolean(p));
  const content=scroll(this.parent,'Hand',rect.hand,b.hand.length*112+8,150,true);
  b.hand.forEach((c,i)=>{const card=presentCard(session,c.uid);button(content,'Card-'+c.uid,`${card.cost}灵力 · ${card.name}\n${card.description}${card.canPlay?'':'\n'+card.reason}`,{x:60+i*112,y:-75,width:106,height:140},()=>handlers.selectCard(c.uid),true,c.uid===selection.selectedUid,13);});
  button(this.parent,'EndTurn',handlers.canEndTurn===false?'请稍候…':'结束回合',rect.end,()=>handlers.action({type:'END_TURN'}),handlers.canEndTurn!==false);
 }
}
