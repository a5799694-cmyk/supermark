export const CARDS = Object.freeze({
  roll: { id:'roll', name:'这个需求今天必须飞升', cost:1, type:'attack', damage:6, upgraded:{damage:9} },
  'not-this': { id:'not-this', name:'这锅不在本座OKR里', cost:1, type:'skill', shield:7, upgraded:{shield:10} },
  breathe: { id:'breathe', name:'带薪吐纳，领导勿扰', cost:0, type:'skill', draw:1, rage:1, exile:true, upgraded:{draw:2} },
  groups: { id:'groups', name:'三魂在开会，七魄在回收到', cost:1, type:'skill', clones:1, draw:1, route:'clone' },
  possess: { id:'possess', name:'向上管理，物理夺舍', cost:1, type:'skill', route:'clone' },
  autoreply: { id:'autoreply', name:'人已飞升，消息自动已读', cost:1, type:'attack', damage:7, route:'clone' },
  signin: { id:'signin', name:'渡劫先打卡，迟到扣功德', cost:1, type:'skill', shield:8, route:'counter' },
  overtime: { id:'overtime', name:'九九六雷劫，零零七飞升', cost:1, type:'skill', rage:2, route:'counter' },
  performance: { id:'performance', name:'命可以不要，绩效必须校准', cost:2, type:'attack', damage:5, route:'counter' }
});

export const STARTER_IDS = Object.freeze(['roll','roll','roll','not-this','not-this','breathe']);

export function createCardInstance(cardId, uid) {
  if (!CARDS[cardId]) throw new Error(`Unknown card: ${cardId}`);
  return { uid, cardId, upgraded:false };
}
