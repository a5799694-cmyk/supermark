export const CARDS = Object.freeze({
  roll: { id:'roll', name:'时椒炒鱿', cost:1, type:'attack', damage:6, upgraded:{damage:9} },
  'not-this': { id:'not-this', name:'关我鬼事', cost:1, type:'skill', shield:7, upgraded:{shield:10} },
  breathe: { id:'breathe', name:'扮死抖气', cost:0, type:'skill', draw:1, rage:1, exile:true, upgraded:{draw:2} },
  groups: { id:'groups', name:'散水分身', cost:1, type:'skill', clones:1, draw:1, route:'clone', sect:'clone' },
  possess: { id:'possess', name:'老细上身', cost:1, type:'skill', route:'clone', sect:'clone' },
  autoreply: { id:'autoreply', name:'收到，收皮', cost:1, type:'attack', damage:7, route:'clone', sect:'clone' },
  signin: { id:'signin', name:'打卡撞鬼', cost:1, type:'skill', shield:8, route:'counter', sect:'thunder' },
  overtime: { id:'overtime', name:'做到起火', cost:1, type:'skill', rage:2, route:'counter', sect:'thunder' },
  performance: { id:'performance', name:'冚家铲掌', cost:2, type:'attack', damage:5, route:'counter', sect:'thunder' },
  triple: {id:'triple',name:'劈炮三连',cost:1,type:'attack',damage:2,hits:3,sect:'sword'},
  'free-slash': {id:'free-slash',name:'冇钱照斩',cost:0,type:'attack',damage:3,exile:true,sect:'sword'},
  'draw-slash': {id:'draw-slash',name:'拔剑散水',cost:1,type:'attack',damage:5,draw:1,sect:'sword'},
  discount: {id:'discount',name:'唔讲武德',cost:0,type:'skill',exile:true,sect:'sword'},
  stance: {id:'stance',name:'收工架势',cost:1,type:'skill',shield:5,sect:'sword'},
  'sword-ultimate': {id:'sword-ultimate',name:'一刀炒晒',cost:3,type:'attack',damage:12,ultimate:true,sect:'sword'},
  'thunder-ultimate': {id:'thunder-ultimate',name:'全场收皮',cost:3,type:'attack',damage:5,targetMode:'all',ultimate:true,sect:'thunder'},
  'rage-guard': {id:'rage-guard',name:'孭锅起盾',cost:1,type:'skill',shield:5,rage:1,sect:'thunder'},
  'rage-energy': {id:'rage-energy',name:'雷气回流',cost:0,type:'skill',rageCost:2,energyGain:1,draw:1,exile:true,sect:'thunder'},
  'clone-guard': {id:'clone-guard',name:'替身孭锅',cost:1,type:'skill',shield:4,sect:'clone'},
  'clone-ultimate': {id:'clone-ultimate',name:'搏命开片',cost:2,type:'attack',damage:6,hpCost:6,cloneMin:1,ultimate:true,sect:'clone'},
  'clone-energy': {id:'clone-energy',name:'本体诈死',cost:0,type:'skill',cloneCost:1,energyGain:1,draw:1,exile:true,sect:'clone'}
});

export const STARTER_IDS = Object.freeze(['roll','roll','roll','not-this','not-this','breathe']);

export function createCardInstance(cardId, uid) {
  if (!CARDS[cardId]) throw new Error(`Unknown card: ${cardId}`);
  return { uid, cardId, upgraded:false };
}
