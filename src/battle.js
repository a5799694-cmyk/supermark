import { CARDS } from './cards.js?v=20261017-art1';
import { ENEMIES } from './enemies.js?v=20261017-art1';
import { cardPreview } from './card-effects.js?v=20261017-art1';
import { shuffle } from './random.js?v=20261017-art1';

const cap = (value,max) => Math.max(0,Math.min(max,value));
const clone = value => structuredClone(value);
const log = (state,message) => { state.log = [...state.log,message].slice(-30); };

function drawCards(state,count) {
  for (let n=0;n<count;n++) {
    if (!state.draw.length && state.discard.length) {
      const mixed=shuffle(state.discard,state.seed); state.draw=mixed.items; state.seed=mixed.seed; state.discard=[];
    }
    if (!state.draw.length) break;
    state.hand.push(state.draw.shift());
  }
}

export function createBattle(deck,hp,enemyIds,seed,sectId='legacy') {
  const mixed=shuffle(deck,seed);
  const state={sectId,attacksPlayed:0,thunderTriggered:false,hp,maxHp:40,energy:3,shield:0,rage:0,clones:sectId==='clone'?1:0,hand:[],draw:mixed.items,discard:[],exile:[],
    enemies:enemyIds.map((type,i)=>{const d=ENEMIES[type]; if(!d) throw new Error(`Unknown enemy: ${type}`); return {id:`e${i}`,type,name:d.name,hp:d.hp,shield:0,actionIndex:d.start||0};}),
    turn:1,seed:mixed.seed,status:'playing',effects:{nextAttackCloneBonus:0,nextAttackBonus:0,nextAttackDiscount:0,shieldRage:false,counterRage:false},log:[]};
  drawCards(state,4); return state;
}

function hitEnemy(state,targetId,damage) {
  const target=state.enemies.find(e=>e.id===targetId && e.hp>0); if(!target) return false;
  const hpBefore=target.hp;
  const absorbed=Math.min(target.shield,damage); target.shield-=absorbed; target.hp=Math.max(0,target.hp-(damage-absorbed));
  log(state,`${target.name}：掉血${hpBefore-target.hp}，破盾${absorbed}${target.hp===0?'，击败':''}`);
  if(state.enemies.every(e=>e.hp<=0)) state.status='won';
  return true;
}

export function playCard(input,uid,targetId) {
  if(input.status!=='playing') return input;
  const instance=input.hand.find(c=>c.uid===uid);if(!instance)return input;
  const card=CARDS[instance.cardId],preview=cardPreview(input,instance);if(!preview.canPlay)return input;
  if(preview.targetMode==='single'&&!input.enemies.some(e=>e.id===targetId&&e.hp>0))return input;
  const state=clone(input);state.hand=state.hand.filter(c=>c.uid!==uid);state.energy-=preview.cost;state.hp-=preview.hpCost;
  state.rage-=card.rageCost||0;state.clones-=card.cloneCost||0;
  log(state,`打出「${card.name}」 · 耗灵${preview.cost}${preview.hpCost?` · 支付${preview.hpCost}生命`:''}`);
  const liveBefore=state.enemies.filter(e=>e.hp>0).length;
  if(card.type==='attack'){
    state.attacksPlayed=(state.attacksPlayed||0)+1;
    state.effects.nextAttackCloneBonus=0;state.effects.nextAttackBonus=0;state.effects.nextAttackDiscount=0;
    const targets=preview.targetMode==='all'?state.enemies.filter(e=>e.hp>0).map(e=>e.id):[targetId];
    for(let t=0;t<targets.length;t++)for(let n=0;n<preview.hits;n++){
      if(state.status!=='playing'||!state.enemies.some(e=>e.id===targets[t]&&e.hp>0))break;
      hitEnemy(state,targets[t],preview.damage+(t===0&&n===0?preview.bonus:0));
    }
    if(card.id==='performance'||card.id==='thunder-ultimate')state.rage=0;
    if(card.id==='autoreply'){
      if(liveBefore===1)state.shield+=3;
      else if(state.enemies.find(e=>e.id===targetId).hp===0){
        for(let i=0;i<state.clones&&state.status==='playing';i++){
          const other=state.enemies.find(e=>e.id!==targetId&&e.hp>0);if(other)hitEnemy(state,other.id,2);
        }
      }
    }
  }else if(card.id==='groups')state.clones=cap(state.clones+1,3);
  else if(card.id==='possess'){if(state.clones)state.effects.nextAttackCloneBonus=3*state.clones;else drawCards(state,1);}
  else if(card.id==='discount')state.effects.nextAttackDiscount=1;
  else if(card.id==='stance')state.effects.nextAttackBonus=3;
  else if(card.id==='signin')state.effects.shieldRage=true;
  else if(card.id==='overtime')state.effects.counterRage=true;
  state.shield+=preview.shield;state.rage=cap(state.rage+(card.rage||0),12);state.energy+=preview.energyGain;
  // A terminal attack does not draw more cards after victory.
  if(state.status==='playing'&&preview.draw)drawCards(state,preview.draw);
  if(card.exile)state.exile.push(instance);else state.discard.push(instance);
  log(state,`结算：灵力${state.energy} · 护盾${state.shield} · 怒气${state.rage} · 分身${state.clones}`);return state;
}

function enemyHit(state,amount) {
  const absorbed=Math.min(state.shield,amount); state.shield-=absorbed; const lifeDamage=amount-absorbed; state.hp=Math.max(0,state.hp-lifeDamage);
  if(state.effects.shieldRage && state.shield===0) { state.rage=cap(state.rage+3,12); state.effects.shieldRage=false; }
  if(state.sectId==='thunder'&&lifeDamage>0&&!state.thunderTriggered){state.rage=cap(state.rage+1,12);state.thunderTriggered=true;}
  if(state.effects.counterRage && lifeDamage>0) state.rage=cap(state.rage+2,12);
  log(state,`受到${lifeDamage}生命伤害，护盾抵挡${absorbed}`);
  if(state.hp===0) state.status='lost';
}

export function endTurn(input) {
  if(input.status!=='playing') return input;
  const state=clone(input); log(state,`第${state.turn}回合结束 · 敌方行动`); state.discard.push(...state.hand); state.hand=[];
  for(const enemy of state.enemies) {
    if(enemy.hp<=0 || state.status!=='playing') continue;
    enemy.shield=0; const def=ENEMIES[enemy.type]; const action=def.actions[enemy.actionIndex%def.actions.length];
    log(state,`${enemy.name}：${action.type==='shield'?'蓄盾':'攻击'}${action.value}${action.hits?`×${action.hits}`:''}`);
    if(action.type==='shield') enemy.shield+=action.value;
    else { const hits=action.hits||1; for(let i=0;i<hits && state.status==='playing';i++) enemyHit(state,action.value); }
    enemy.actionIndex=(enemy.actionIndex+1)%def.actions.length;
  }
  if(state.status==='playing') { state.turn++; state.energy=3; state.attacksPlayed=0; state.thunderTriggered=false; state.effects.nextAttackDiscount=0; state.effects.nextAttackBonus=0; if(state.sectId!=='legacy')state.effects.nextAttackCloneBonus=0; state.shield=0; state.effects.shieldRage=false; state.effects.counterRage=false; drawCards(state,4); log(state,`第${state.turn}回合 · 抽${state.hand.length}牌，灵力重置为3`); }
  return state;
}
