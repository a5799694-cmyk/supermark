import { CARDS } from './cards.js?v=20261013';
import { ENEMIES } from './enemies.js?v=20261013';
import { shuffle } from './random.js?v=20261013';

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

export function createBattle(deck,hp,enemyIds,seed) {
  const mixed=shuffle(deck,seed);
  const state={hp,maxHp:40,energy:3,shield:0,rage:0,clones:0,hand:[],draw:mixed.items,discard:[],exile:[],
    enemies:enemyIds.map((type,i)=>{const d=ENEMIES[type]; if(!d) throw new Error(`Unknown enemy: ${type}`); return {id:`e${i}`,type,name:d.name,hp:d.hp,shield:0,actionIndex:d.start||0};}),
    turn:1,seed:mixed.seed,status:'playing',effects:{nextAttackCloneBonus:0,shieldRage:false,counterRage:false},log:[]};
  drawCards(state,4); return state;
}

function hitEnemy(state,targetId,damage) {
  const target=state.enemies.find(e=>e.id===targetId && e.hp>0); if(!target) return false;
  const absorbed=Math.min(target.shield,damage); target.shield-=absorbed; target.hp=Math.max(0,target.hp-(damage-absorbed));
  if(state.enemies.every(e=>e.hp<=0)) state.status='won';
  return true;
}

export function playCard(input,uid,targetId) {
  if(input.status!=='playing') return input;
  const cardInstance=input.hand.find(c=>c.uid===uid); if(!cardInstance) return input;
  const card=CARDS[cardInstance.cardId]; if(!card || input.energy<card.cost) return input;
  if(card.type==='attack' && !input.enemies.some(e=>e.id===targetId && e.hp>0)) return input;
  const state=clone(input); const instance=state.hand.find(c=>c.uid===uid);
  state.hand=state.hand.filter(c=>c.uid!==uid); state.energy-=card.cost;
  const value=(key)=>instance.upgraded && card.upgraded?.[key]!==undefined?card.upgraded[key]:card[key];
  const manualAttackBonus=card.type==='attack'?state.effects.nextAttackCloneBonus:0;
  if(card.type==='attack') state.effects.nextAttackCloneBonus=0;
  if(card.id==='roll') hitEnemy(state,targetId,value('damage')+manualAttackBonus);
  else if(card.id==='not-this') state.shield+=value('shield');
  else if(card.id==='breathe') { state.rage=cap(state.rage+card.rage,12); drawCards(state,value('draw')); }
  else if(card.id==='groups') { state.clones=cap(state.clones+1,3); drawCards(state,1); }
  else if(card.id==='possess') { if(state.clones) state.effects.nextAttackCloneBonus=3*state.clones; else drawCards(state,1); }
  else if(card.id==='autoreply') { const before=state.enemies.find(e=>e.id===targetId).hp; hitEnemy(state,targetId,7+manualAttackBonus); if(before>0 && state.enemies.find(e=>e.id===targetId).hp===0 && state.status==='playing') { const others=state.enemies.filter(e=>e.hp>0); if(others.length) for(const enemy of others) { if(state.status==='playing') hitEnemy(state,enemy.id,2*state.clones); } } else if(before>0 && state.enemies.filter(e=>e.hp>0).length===1) state.shield+=3; }
  else if(card.id==='signin') { state.shield+=8; state.effects.shieldRage=true; }
  else if(card.id==='overtime') { state.rage=cap(state.rage+2,12); state.effects.counterRage=true; }
  else if(card.id==='performance') { hitEnemy(state,targetId,5+2*state.rage+manualAttackBonus); state.rage=0; }
  if(card.exile) state.exile.push(instance); else state.discard.push(instance);
  log(state,`打出「${card.name}」`); return state;
}

function enemyHit(state,amount) {
  const absorbed=Math.min(state.shield,amount); state.shield-=absorbed; const lifeDamage=amount-absorbed; state.hp=Math.max(0,state.hp-lifeDamage);
  if(state.effects.shieldRage && state.shield===0) { state.rage=cap(state.rage+3,12); state.effects.shieldRage=false; }
  if(state.effects.counterRage && lifeDamage>0) state.rage=cap(state.rage+2,12);
  if(state.hp===0) state.status='lost';
}

export function endTurn(input) {
  if(input.status!=='playing') return input;
  const state=clone(input); state.discard.push(...state.hand); state.hand=[];
  for(const enemy of state.enemies) {
    if(enemy.hp<=0 || state.status!=='playing') continue;
    enemy.shield=0; const def=ENEMIES[enemy.type]; const action=def.actions[enemy.actionIndex%def.actions.length];
    if(action.type==='shield') enemy.shield+=action.value;
    else { const hits=action.hits||1; for(let i=0;i<hits && state.status==='playing';i++) enemyHit(state,action.value); }
    enemy.actionIndex=(enemy.actionIndex+1)%def.actions.length;
  }
  if(state.status==='playing') { state.turn++; state.energy=3; state.shield=0; state.effects.shieldRage=false; state.effects.counterRage=false; drawCards(state,4); }
  return state;
}
