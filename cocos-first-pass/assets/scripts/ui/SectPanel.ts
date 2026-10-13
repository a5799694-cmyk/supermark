import {Node} from 'cc';import {SECTS} from '../core/sects';import {FirstPassSession,SessionAction} from '../first-pass/session';import {button,label} from './UiFactory';
export interface Selection {selectedSectId:string|null;selectedUid:string|null}
export interface PanelHandlers {action:(a:SessionAction)=>void;selectSect:(id:string)=>void;selectCard:(uid:string|null)=>void;canEndTurn?:boolean}
export class SectPanel {
 constructor(private parent:Node){}
 render(session:FirstPassSession,selection:Selection,handlers:PanelHandlers){
  label(this.parent,'Intro','白天上班，晚上修仙。\n先拣门派，再去开片。',{x:0,y:280,width:328,height:60},18);
  Object.values(SECTS).forEach((s,i)=>button(this.parent,'Sect-'+s.id,`${s.name} · ${s.style}\n${s.motto}\n${s.passive}`,{x:0,y:175-i*150,width:328,height:135},()=>handlers.selectSect(s.id),true,selection.selectedSectId===s.id,18));
  const id=selection.selectedSectId,valid=Object.prototype.hasOwnProperty.call(SECTS,id||'');
  button(this.parent,'Start',valid?`拜入${SECTS[id].name}`:'先选择门派',{x:0,y:-320,width:270,height:52},()=>handlers.action({type:'START',sectId:id}),valid);
 }
}
