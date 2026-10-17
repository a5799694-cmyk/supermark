import {CARDS} from './cards.js?v=20261017-art1';
import {playCard} from './battle.js?v=20261017-art1';

// Use the real pure resolver so shield, multi-hit and pursuit cannot drift from previews.
export function attackForecast(battle,uid,targetId) {
  const card=battle.hand.find(c=>c.uid===uid);
  if(!card||CARDS[card.cardId]?.type!=='attack')return [];
  const after=playCard(battle,uid,targetId);
  if(after===battle)return [];
  return battle.enemies.map((enemy,i)=>({id:enemy.id,
    hpLoss:enemy.hp-after.enemies[i].hp,shieldLoss:enemy.shield-after.enemies[i].shield,
    defeated:enemy.hp>0&&after.enemies[i].hp===0
  })).filter(e=>e.hpLoss||e.shieldLoss);
}
