import {FirstPassSession,SessionAction,applySessionAction} from './session';
export function createDispatcher(options:{getSession:()=>FirstPassSession;setSession:(s:FirstPassSession)=>void;render:()=>void;apply?:typeof applySessionAction;now?:()=>number}){
 const now=options.now||Date.now;
 let locked=false,endTurnUntil=0;
 const dispatch=(action:SessionAction)=>{
  if(locked||action.type==='END_TURN'&&now()<endTurnUntil)return;locked=true;
  try{const before=options.getSession(),after=(options.apply||applySessionAction)(before,action);if(after!==before){
   if(action.type==='END_TURN')endTurnUntil=now()+450;
   else if(action.type==='PLAY_CARD'||action.type==='START'||action.type==='RESTART')endTurnUntil=0;
   options.setSession(after);
  }options.render();}
  finally{Promise.resolve().then(()=>{locked=false;});}
 };
 dispatch.isLocked=()=>locked;dispatch.canEndTurn=()=>now()>=endTurnUntil;return dispatch;
}
