import test from 'node:test';import assert from 'node:assert/strict';
import * as browser from '../../src/battle.js';import {CARDS,createCardInstance} from '../../src/cards.js';import {SECTS,createStarterDeck} from '../../src/sects.js';import {cardPreview} from '../../src/card-effects.js';
import {loadCore} from './compile-core.js';
test('Cocos card definitions and all sect starters equal browser baseline',()=>{
 const cards=loadCore('core/cards'),sects=loadCore('core/sects');
 assert.deepEqual(cards.CARDS,CARDS);assert.equal(Object.keys(cards.CARDS).length,21);assert.deepEqual(sects.SECTS,SECTS);
 for(const sect of Object.keys(SECTS))assert.deepEqual(sects.createStarterDeck(sect),createStarterDeck(sect));
});
test('Cocos first battle sequence and each preview equal browser for all sects and seeds',()=>{
 const core=loadCore('core/battle'),preview=loadCore('core/card-effects').cardPreview;
 for(const sect of Object.keys(SECTS))for(const seed of [1,7,42]){
  let a=browser.createBattle(createStarterDeck(sect),40,['dummy'],seed,sect),b=core.createBattle(createStarterDeck(sect),40,['dummy'],seed,sect);
  assert.deepEqual(b,a);
  for(let moves=0;a.status==='playing'&&moves<80;moves++){
   let acted=false;
   for(const card of a.hand){const p=cardPreview(a,card);assert.deepEqual(preview(b,card),p);
    if(!p.canPlay)continue;
    const next=browser.playCard(a,card.uid,'e0');if(next!==a){b=core.playCard(b,card.uid,'e0');a=next;acted=true;break;}
   }
   if(!acted){a=browser.endTurn(a);b=core.endTurn(b);}
   assert.deepEqual(b,a);
  }
  assert.notEqual(a.status,'playing');
 }
});
test('Cocos illegal actions preserve identity and paid ultimate has the same boundary',()=>{
 const core=loadCore('core/battle');let b=core.createBattle(createStarterDeck('clone'),40,['dummy'],7,'clone');
 for(const [uid,target] of [['missing','e0'],[b.hand.find(c=>CARDS[c.cardId].type==='attack').uid,'missing']])assert.equal(core.playCard(b,uid,target),b);
 const snapshot=structuredClone(b);b.energy=0;assert.equal(core.playCard(b,b.hand.find(c=>CARDS[c.cardId].type==='attack').uid,'e0'),b);
 b={...b,hp:6,energy:3,clones:1,hand:[createCardInstance('clone-ultimate','ultimate')]};const before=structuredClone(b);
 assert.equal(core.playCard(b,'ultimate','e0'),b);assert.deepEqual(b,before);
 b.hp=7;assert.equal(core.playCard(b,'ultimate','e0').hp,1);
 const dead={...snapshot,enemies:snapshot.enemies.map(e=>({...e,hp:0}))};assert.equal(core.playCard(dead,dead.hand.find(c=>CARDS[c.cardId].type==='attack').uid,'e0'),dead);
});
test('Cocos multi-target ultimates and clone pursuit keep exact resolver and combat log parity',()=>{
 const core=loadCore('core/battle');
 for(const [sect,id] of [['sword','triple'],['thunder','thunder-ultimate'],['clone','autoreply']]){
  const a=browser.createBattle(createStarterDeck(sect),40,['dummy','dummy-shield'],7,sect);
  a.hand=[createCardInstance(id,'test')];a.clones=3;a.rage=4;a.enemies[0].hp=1;a.enemies[0].shield=2;
  const target=sect==='thunder'?undefined:'e0';
  const x=browser.playCard(a,'test',target),y=core.playCard(structuredClone(a),'test',target);
  assert.deepEqual(y,x);assert.deepEqual(core.endTurn(y),browser.endTurn(x));
 }
});
