import {_decorator,Component,Node,UITransform,Canvas,view,ResolutionPolicy,error,Color} from 'cc';
import {createSession,FirstPassSession} from '../first-pass/session';import {createDispatcher} from '../first-pass/dispatch';
import {SectPanel,Selection,PanelHandlers} from './SectPanel';import {BattlePanel} from './BattlePanel';import {RewardPanel} from './RewardPanel';import {ResultPanel} from './ResultPanel';import {node,box,label,clear,palette} from './UiFactory';
const {ccclass}=_decorator;
@ccclass('FirstPassApp')
export class FirstPassApp extends Component {
 private session:FirstPassSession;
 private selection:Selection={selectedSectId:null,selectedUid:null};
 private root:Node|null=null;
 private stage:Node|null=null;
 private dispatch:ReturnType<typeof createDispatcher>;
 start(){
  if(!this.getComponent(Canvas)||!this.getComponent(UITransform)){error('FirstPassApp: Main.scene requires Canvas and UITransform on the entry node. Reopen assets/scenes/Main.scene.');return;}
  const camera=this.getComponent(Canvas).cameraComponent;
  if(!camera||!camera.isValid||!camera.enabled||!camera.node.activeInHierarchy){error('FirstPassApp: Main.scene requires an active UICamera_Canvas linked to Canvas.cameraComponent. Restore the camera or reopen the original Main.scene.');return;}
  view.setDesignResolutionSize(360,800,ResolutionPolicy.SHOW_ALL);
  this.session=createSession(Date.now()>>>0);
  this.root=node(this.node,'FirstPassRoot',{x:0,y:0,width:360,height:800});
  box(this.root,'Background',{x:0,y:0,width:360,height:800},palette.background);
  this.stage=node(this.root,'Stage',{x:0,y:0,width:360,height:800});
  label(this.root,'Footer','Cocos 3.8.8 · 首轮迁移验证，刷新会重开',{x:0,y:-382,width:338,height:28},11,palette.muted);
  this.dispatch=createDispatcher({getSession:()=>this.session,setSession:s=>{this.session=s;this.selection={selectedSectId:null,selectedUid:null};},render:()=>this.draw()});
  this.node.on(Node.EventType.SIZE_CHANGED,this.fit,this);this.fit();this.draw();
 }
 private fit(){if(!this.root)return;const size=this.node.getComponent(UITransform)?.contentSize;if(size){const scale=Math.min(size.width/360,size.height/800);this.root.setScale(scale,scale,1);}}
 private draw(){
  if(!this.stage)return;clear(this.stage);
  const title=this.session.phase==='sect'?'梦里修仙':this.session.phase==='battle'?'第一战 · 考勤仙吏':this.session.phase==='reward'?'拣招开打':this.session.phase==='lost'?'再来一局':'首轮验证';
  label(this.stage,'Title',title,{x:0,y:355,width:328,height:60},28);
  const handlers:PanelHandlers={action:a=>{this.dispatch(a);if(a.type==='END_TURN')this.scheduleOnce(()=>this.draw(),0.46);},canEndTurn:this.dispatch.canEndTurn(),selectSect:id=>{if(this.dispatch.isLocked())return;this.selection.selectedSectId=id;this.draw();},selectCard:uid=>{if(this.dispatch.isLocked())return;this.selection.selectedUid=uid;this.draw();}};
  if(this.session.phase==='sect')new SectPanel(this.stage).render(this.session,this.selection,handlers);
  else if(this.session.phase==='battle')new BattlePanel(this.stage).render(this.session,this.selection,handlers);
  else if(this.session.phase==='reward')new RewardPanel(this.stage).render(this.session,this.selection,handlers);
  else new ResultPanel(this.stage).render(this.session,this.selection,handlers);
 }
 onDestroy(){this.node.off(Node.EventType.SIZE_CHANGED,this.fit,this);}
}
