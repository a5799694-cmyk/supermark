import {createCardInstance} from './cards.js?v=20261013-sects1';
export const SECTS=Object.freeze({
 sword:{id:'sword',name:'斩仙堂',motto:'加班免谈，老细照斩。',style:'连击 · 单体爆发',passive:'每回合第3张手动攻击追加3伤害。',starter:['roll','roll','triple','not-this','not-this','breathe'],core:'discount',ultimate:'sword-ultimate',synergy:['free-slash','draw-slash']},
 thunder:{id:'thunder',name:'惊雷府',motto:'有锅我扛，有雷你尝。',style:'护盾 · 怒气 · 群攻',passive:'每回合首次受到生命伤害，获得1怒气。',starter:['roll','roll','roll','not-this','signin','breathe'],core:'overtime',ultimate:'thunder-ultimate',synergy:['performance','rage-energy']},
 clone:{id:'clone',name:'百身门',motto:'分身上岗，本体躺躺。',style:'分身 · 增幅 · 追击',passive:'每场战斗开始获得1分身。',starter:['roll','roll','autoreply','not-this','not-this','breathe'],core:'groups',ultimate:'clone-ultimate',synergy:['possess']}
});
export function createStarterDeck(id){if(!SECTS[id])throw Error('Unknown sect');return SECTS[id].starter.map((cardId,i)=>createCardInstance(cardId,`c${i+1}`));}
