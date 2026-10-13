export const CARDS = Object.freeze({
  roll: { id:'roll', name:'时椒炒鱿', cost:1, type:'attack', damage:6, upgraded:{damage:9} },
  'not-this': { id:'not-this', name:'关我鬼事', cost:1, type:'skill', shield:7, upgraded:{shield:10} },
  breathe: { id:'breathe', name:'扮死抖气', cost:0, type:'skill', draw:1, rage:1, exile:true, upgraded:{draw:2} },
  groups: { id:'groups', name:'散水分身', cost:1, type:'skill', clones:1, draw:1, route:'clone' },
  possess: { id:'possess', name:'老细上身', cost:1, type:'skill', route:'clone' },
  autoreply: { id:'autoreply', name:'收到，收皮', cost:1, type:'attack', damage:7, route:'clone' },
  signin: { id:'signin', name:'打卡撞鬼', cost:1, type:'skill', shield:8, route:'counter' },
  overtime: { id:'overtime', name:'做到起火', cost:1, type:'skill', rage:2, route:'counter' },
  performance: { id:'performance', name:'冚家铲掌', cost:2, type:'attack', damage:5, route:'counter' }
});

export const STARTER_IDS = Object.freeze(['roll','roll','roll','not-this','not-this','breathe']);

export function createCardInstance(cardId, uid) {
  if (!CARDS[cardId]) throw new Error(`Unknown card: ${cardId}`);
  return { uid, cardId, upgraded:false };
}
