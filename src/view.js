import {characterArt} from './character-art.js?v=20261017-art1';
import {attackForecast} from './combat-feedback.js?v=20261017-art1';
import {CARDS} from './cards.js?v=20261017-art1';
import {ENEMIES} from './enemies.js?v=20261017-art1';
import {SECTS} from './sects.js?v=20261017-art1';
import {cardPreview} from './card-effects.js?v=20261017-art1';
import {EVENT_COPY,eventLife,canReplace} from './events.js?v=20261017-art1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,cls='primary')=>`<button class="${cls}" data-action='${esc(JSON.stringify(action))}'>${label}</button>`;
const dreamButton=(label,choice,extra={},disabled=false)=>`<button class="primary" data-action='${esc(JSON.stringify({type:'DREAM_EVENT',choice,...extra}))}' ${disabled?'disabled':''}>${label}</button>`;
export function cardText(c,state){
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
function introView(run,ui){
 if(run.sectId==='legacy')return `<section class="scene intro"><h1>梦里修仙</h1><p>旧梦续打，新梦选派。</p>${button('继续旧梦',{type:'START'})}</section>`;
 return `<section class="scene intro"><div class="moon mini"></div><h1>梦里修仙</h1><p>返工返到死，死咗仲要返。</p><div class="sect-list">${Object.values(SECTS).map(s=>`<button class="sect-choice ${ui.selectedSectId===s.id?'chosen':''}" data-sect="${s.id}"><span class="sect-portrait">${characterArt(s.id)}</span><strong>${s.name}</strong><span>${s.style}</span><p>${s.motto}</p><small>${s.passive}</small></button>`).join('')}</div><button class="primary" data-start ${!SECTS[ui.selectedSectId]?'disabled':''}>${SECTS[ui.selectedSectId]?`拜入${SECTS[ui.selectedSectId].name}`:'拣个门派，开工渡劫'}</button>${run.souvenir?`<div class="souvenir">纪念品：${esc(run.souvenir)}</div>`:''}</section>`;
}
function battleView(run,ui){
 const b=run.battle,sect=SECTS[run.sectId],selected=b.hand.find(c=>c.uid===ui.selectedUid),preview=selected&&cardPreview(b,selected);
 const forecasts=preview?.canPlay&&preview.targetMode==='all'?attackForecast(b,selected.uid):[];
 const enemies=b.enemies.map(e=>{const d=ENEMIES[e.type],a=d.actions[e.actionIndex%d.actions.length];const forecast=preview?.canPlay?(preview.targetMode==='single'?attackForecast(b,selected.uid,e.id):forecasts).find(f=>f.id===e.id):null;const intent=a.type==='shield'?`蓄盾 ${a.value}`:a.type==='multi'?`攻击 ${a.value}×${a.hits}`:`攻击 ${a.value}`;return `<button class="enemy ${e.hp<=0?'dead':''}" data-target="${e.id}" ${!preview?.canPlay||preview.targetMode!=='single'||e.hp<=0?'disabled':''}><span class="enemy-art ${e.type==='boss'?'boss-art':''}">${e.type==='boss'?characterArt('boss'):'傀'}</span><strong>${esc(d.name)}</strong><small>${intent}</small><span>命 ${e.hp} · 盾 ${e.shield}</span>${forecast?`<small class="forecast">预计掉血${forecast.hpLoss} · 破盾${forecast.shieldLoss}${forecast.defeated?' · 击败':''}</small>`:''}</button>`;}).join('');
 const cards=b.hand.map(c=>{const d=CARDS[c.cardId],p=cardPreview(b,c);return `<button class="card ${ui.selectedUid===c.uid?'selected':''} ${!p.canPlay?'unavailable':''}" data-card="${c.uid}"><b class="cost">${p.cost}</b>${d.ultimate?'<span class="ultimate">大招</span>':''}<strong>${esc(d.name)}</strong><small>${esc(cardText(c,b))}</small>${!p.canPlay?`<span class="reason">${p.reason}</span>`:''}</button>`;}).join('');
 const inspect=selected?`<div class="inspect"><b>${esc(CARDS[selected.cardId].name)} · ${preview.cost}灵力</b><p>${esc(cardText(selected,b))}</p>${preview.hpCost?'<strong class="life-cost">支付6生命，无视护盾</strong>':''}${!preview.canPlay?`<small>${preview.reason}</small>`:preview.targetMode==='single'?'<small>请选择上方目标</small>':'<button class="ghost" data-confirm-card>确认打出</button>'}<button class="ghost" data-cancel>取消</button></div>`:'';
 return `<section class="battle"><header><span>第 ${b.turn} 回合</span><span>灵力 ${b.energy} / 基础3</span></header><div class="sect-status"><b>${sect?.name||'旧梦修士'}</b><small>${sect?.passive||'本局沿用旧牌组'}${run.sectId==='sword'?` · 已攻${b.attacksPlayed}张`:''}</small></div><div class="sky-seal">雷劫审批区</div><div class="enemies">${enemies}</div><div class="hero"><div class="hero-art">${characterArt(run.sectId,ui.actorPose||'idle')||'<div class="avatar">修</div>'}</div><div class="stats"><span>命 ${b.hp}/40</span><span>盾 ${b.shield}</span><span>怒 ${b.rage}/12</span><span>分身 ${b.clones}/3</span></div></div>${inspect}<div class="hand">${cards}</div><div class="pile-counts">抽牌堆 ${b.draw.length} · 弃牌堆 ${b.discard.length} · 放逐 ${b.exile.length}</div>${button('结束回合',{type:'END_TURN'},'end-turn')}<details class="combat-log"><summary>战报 · 最近${b.log.length}条</summary><ol>${b.log.slice().reverse().map(line=>`<li>${esc(line)}</li>`).join('')}</ol></details></section>`;
}
function rewardView(run){return `<section class="scene"><h2>拣招开打</h2><p>功法拣好，老细放倒。</p><div class="reward-list">${run.rewards.map(id=>{const d=CARDS[id];return `<button class="reward" data-action='${esc(JSON.stringify({type:'CHOOSE_REWARD',cardId:id}))}'><b>${d.ultimate?'【大招】':''}${esc(d.name)} · ${d.cost}灵力</b><small>${esc(cardText({cardId:id,upgraded:false}))}</small></button>`;}).join('')}</div>${button('唔要',{type:'CHOOSE_REWARD',cardId:null},'ghost')}</section>`;}
function eventView(run,ui){const pending=ui.pendingAction&&run.deck.find(c=>c.uid===ui.pendingAction.uid);return `<section class="scene"><h2>炒牌大会</h2><p>废牌删开，好牌改帅。</p><small>删一张牌，或强化一张通用牌。</small>${pending?`<div class="inspect"><b>确认${ui.pendingAction.kind==='delete'?'删除':'强化'}「${esc(CARDS[pending.cardId].name)}」？</b><p>${esc(cardText({...pending,upgraded:ui.pendingAction.kind==='upgrade'||pending.upgraded}))}</p><button class="ghost" data-confirm-event>确认</button><button class="ghost" data-cancel-event>取消</button></div>`:''}<div class="reward-list">${run.deck.map(c=>`<div class="event-card"><div><b>${esc(CARDS[c.cardId].name)}${c.upgraded?' ＋':''}</b><small>${esc(cardText(c))}</small></div><span><button class="ghost" data-event='${esc(JSON.stringify({type:'CHOOSE_EVENT',kind:'delete',uid:c.uid}))}' ${run.deck.length<=5||CARDS[c.cardId].type==='attack'&&run.deck.filter(x=>CARDS[x.cardId].type==='attack').length===1?'disabled':''}>删除</button>${CARDS[c.cardId].upgraded&&!c.upgraded?`<button class="primary" data-event='${esc(JSON.stringify({type:'CHOOSE_EVENT',kind:'upgrade',uid:c.uid}))}'>强化</button>`:''}</span></div>`).join('')}</div></section>`;}
function dreamEventView(run){
 const e=run.adventure.current,copy=EVENT_COPY[e.kind],cost=eventLife(10);
 const cardDetail=c=>`<b>${esc(CARDS[c.cardId].name)}${c.upgraded?' ＋':''} · ${CARDS[c.cardId].cost}灵力</b><small>${esc(cardText(c))}</small>`;
 const offered=choice=>`<div class="reward-list">${e.offers.map(id=>`<div class="event-card"><div>${cardDetail({cardId:id,upgraded:false})}</div>${dreamButton(choice==='replace'?'确认换入':`支付${cost}生命，拿走`,choice,{cardId:id},choice==='replace'?!canReplace(run,id):run.hp<=cost)}</div>`).join('')}</div>`;
 let body='';
 if(e.kind==='cat'){
  const source=run.deck.find(c=>c.uid===e.selectedUid);
  body='<p>免费换牌一次：旧牌换新牌，原有强化不会保留。牌组至少保留一张攻击牌。</p>';
  if(source)body+=`<div class="inspect">正在换出：${cardDetail(source)}</div>${offered('replace')}${dreamButton('取消，重新选牌','cancel')}`;
  else body+=`<p>先选要换出的牌，再看三张候选；不满意可取消。</p><div class="reward-list">${run.deck.map(c=>`<div class="event-card"><div>${cardDetail(c)}</div>${dreamButton('选择换出','select',{uid:c.uid})}</div>`).join('')}</div>`;
 }else if(e.kind==='rest'){
  body=`<p>静音休息：恢复${eventLife(20)}生命，最多回到40。或强化一张通用牌，二选一。</p>${dreamButton(`消息静音，恢复${eventLife(20)}生命`,'heal')}<div class="reward-list">${run.deck.map(c=>`<div class="event-card"><div>${cardDetail(c)}${CARDS[c.cardId].upgraded&&!c.upgraded?`<small>强化后：${esc(cardText({...c,upgraded:true}))}</small>`:''}</div>${dreamButton('边回边练，强化这张','upgrade',{uid:c.uid},c.upgraded||!CARDS[c.cardId].upgraded)}</div>`).join('')}</div>`;
 }else{
  body=`<p>${e.kind==='work'?`准点收工恢复${eventLife(10)}生命；接急单支付${cost}生命，从以下三张牌中选一张。`:`先看功法：支付${cost}生命，获得以下这张牌。`}支付后至少剩1生命。</p>${run.hp<=cost?'<p class="life-cost">生命不足：支付后须至少剩1生命。</p>':''}${e.kind==='work'?dreamButton(`准点收工，恢复${eventLife(10)}生命`,'heal'):''}${offered('take')}`;
 }
 return `<section class="scene dream-event"><small>梦中偶遇 · 生命 ${run.hp}/40</small><h2>${copy.title}</h2><p>${copy.line}</p><p>${copy.text}</p>${body}${button('离开，继续赶路',{type:'DREAM_EVENT',choice:'leave'},'ghost')}</section>`;
}
export function render(root,run,ui,dispatch){
 let content='';
 if(ui.recoveryRequired)content=`<section class="scene"><h2>存档需要处理</h2><p>${esc(ui.storageError)}</p><p>原存档不会被自动覆盖，确认后清除并重开。</p><button class="primary" data-recover>清除并重新开始</button></section>`;
 else if(run.stage==='intro')content=introView(run,ui);
 else if(['battle','boss'].includes(run.stage))content=battleView(run,ui);
 else if(run.stage==='reward')content=rewardView(run);
 else if(run.stage==='event')content=eventView(run,ui);
 else if(run.stage==='dream-event')content=dreamEventView(run);
 else if(run.stage==='second-ready')content=`<section class="scene"><h2>又要开会</h2><p>一人讲完，两人加班。</p>${button('继续排队',{type:'CONTINUE'})}</section>`;
 else if(run.stage==='boss-ready')content=`<section class="scene"><h2>老细驾到</h2><p>画饼唔食，雷劈剑劈。</p>${button('面见审批官',{type:'CONTINUE'})}</section>`;
 else content=`<section class="scene result"><h1>${run.result==='won'?'散水成功':'惨遭炒鱿'}</h1><p>${run.result==='won'?'飞升唔加薪，散水做仙人。':'炒鱿冇赔偿，瞓醒再开场。'}</p>${run.souvenir?`<div class="souvenir">纪念品：${esc(run.souvenir)}</div>`:''}${button('唔服，再嚟',{type:'RESTART',seed:(Date.now()&0xffffffff)>>>0})}</section>`;
 root.innerHTML=`<div class="game-shell">${ui.storageError&&!ui.recoveryRequired?`<div class="warning">${esc(ui.storageError)}</div>`:''}${content}<footer>梦里修仙 · 三门派版 v0.3.2 · 人物美术 · 20261017</footer></div>`;
 const redraw=()=>render(root,run,ui,dispatch);
 root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>dispatch(JSON.parse(el.dataset.action))));
 root.querySelectorAll('[data-sect]').forEach(el=>el.addEventListener('click',()=>{ui.selectedSectId=el.dataset.sect;redraw();}));
 root.querySelector('[data-start]')?.addEventListener('click',()=>dispatch({type:'START',sectId:ui.selectedSectId}));
 root.querySelectorAll('[data-card]').forEach(el=>el.addEventListener('click',()=>{ui.selectedUid=el.dataset.card;redraw();}));
 root.querySelectorAll('[data-target]').forEach(el=>el.addEventListener('click',()=>ui.selectedUid&&dispatch({type:'PLAY_CARD',uid:ui.selectedUid,targetId:el.dataset.target})));
 root.querySelector('[data-confirm-card]')?.addEventListener('click',()=>ui.selectedUid&&dispatch({type:'PLAY_CARD',uid:ui.selectedUid}));
 root.querySelector('[data-cancel]')?.addEventListener('click',()=>{ui.selectedUid=null;redraw();});
 root.querySelectorAll('[data-event]').forEach(el=>el.addEventListener('click',()=>{ui.pendingAction=JSON.parse(el.dataset.event);redraw();}));
 root.querySelector('[data-confirm-event]')?.addEventListener('click',()=>dispatch(ui.pendingAction));
 root.querySelector('[data-cancel-event]')?.addEventListener('click',()=>{ui.pendingAction=null;redraw();});
 root.querySelector('[data-recover]')?.addEventListener('click',()=>ui.recover());
}
