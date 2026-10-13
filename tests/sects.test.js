import test from 'node:test';
import assert from 'node:assert/strict';
import {SECTS,createStarterDeck} from '../src/sects.js';
import {CARDS} from '../src/cards.js';
test('three sects have distinct valid six card starters and exact copy',()=>{
 assert.deepEqual(Object.values(SECTS).map(s=>s.name),['斩仙堂','惊雷府','百身门']);
 assert.deepEqual(Object.values(SECTS).map(s=>s.motto),['加班免谈，老细照斩。','有锅我扛，有雷你尝。','分身上岗，本体躺躺。']);
 for(const id of Object.keys(SECTS)){const deck=createStarterDeck(id);assert.equal(deck.length,6);assert.equal(new Set(deck.map(c=>c.uid)).size,6);assert(deck.every(c=>CARDS[c.cardId]));assert.equal(Object.values(CARDS).filter(c=>c.sect===id).length,6);}
 assert.throws(()=>createStarterDeck('bad'));
});
