import { createRun, applyAction } from './run.js?v=20261017-combat1';
import { loadRun, saveRun } from './save.js?v=20261017-combat1';
import { render } from './view.js?v=20261017-combat1';

export function createDispatcher({getRun,setRun,apply=applyAction,save,render:draw,now=Date.now}) {
  let locked=false,endTurnUntil=0;
  const dispatch=action=>{
    if(locked||action.type==='END_TURN'&&now()<endTurnUntil) return; locked=true;
    try { const before=getRun(); const after=apply(before,action); if(after!==before) { if(action.type==='END_TURN')endTurnUntil=now()+450;
      else if(['PLAY_CARD','START','RESTART'].includes(action.type))endTurnUntil=0;
      setRun(after); save(after); } draw(); }
    finally { queueMicrotask(()=>{locked=false}); }
  };
  dispatch.isLocked=()=>locked; dispatch.canEndTurn=()=>now()>=endTurnUntil; return dispatch;
}

export function safeStorage(host=globalThis) {
  try { return {storage:host.localStorage,error:null}; }
  catch { return {storage:null,error:'本地存储不可用，本次进度不会保存'}; }
}

if(typeof document!=='undefined') {
  const root=document.querySelector('#app'); const access=safeStorage(window); const loaded=access.storage?loadRun(access.storage):{run:null,error:access.error}; let run=loaded.run||createRun((Date.now()&0xffffffff)>>>0);
  const ui={selectedUid:null,pendingAction:null,storageError:loaded.error,recoveryRequired:Boolean(loaded.error&&access.storage)};
  let dispatch;
  const draw=()=>render(root,run,ui,dispatch);
  ui.recover=()=>{if(access.storage) access.storage.removeItem('dream-cultivation-v1');run=createRun((Date.now()&0xffffffff)>>>0);ui.recoveryRequired=false;ui.storageError=null;draw()};
  dispatch=createDispatcher({getRun:()=>run,setRun:value=>{run=value;ui.selectedUid=null;ui.pendingAction=null},save:value=>{if(!access.storage||!saveRun(access.storage,value)) ui.storageError='无法保存进度，本次仍可继续游玩'},render:draw});
  draw();
}
