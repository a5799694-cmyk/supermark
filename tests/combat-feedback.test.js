import test from 'node:test';
import assert from 'node:assert/strict';
import {createBattle,playCard,endTurn} from '../src/battle.js';
import {createCardInstance as card} from '../src/cards.js';
import {createStarterDeck} from '../src/sects.js';
import {attackForecast} from '../src/combat-feedback.js';
import {render} from '../src/view.js';
import {createRun,applyAction} from '../src/run.js';
const battle=sect=>createBattle(createStarterDeck(sect),40,['dummy','dummy-shield'],7,sect);
test('forecast resolves shield, multi-hit and kill pursuit with no state mutation',()=>{
 let s=battle('clone');s.hand=[card('autoreply','a')];s.clones=3;s.enemies[0].hp=1;s.enemies[0].shield=2;
 const before=structuredClone(s),p=attackForecast(s,'a','e0');
 assert.deepEqual(p,[{id:'e0',hpLoss:1,shieldLoss:2,defeated:true},{id:'e1',hpLoss:6,shieldLoss:0,defeated:false}]);
 assert.deepEqual(s,before);
 s=battle('sword');s.hand=[card('triple','t')];s.enemies[0].shield=4;
 assert.equal(attackForecast(s,'t','e0')[0].hpLoss,2);
 s.energy=0;assert.deepEqual(attackForecast(s,'t','e0'),[]);
 assert.deepEqual(attackForecast(s,'missing','e0'),[]);
});
test('all-target ultimate forecasts all enemies with shared rage snapshot',()=>{
 const s=battle('thunder');s.hand=[card('thunder-ultimate','u')];s.rage=4;
 assert.deepEqual(attackForecast(s,'u').map(x=>x.hpLoss),[9,9]);assert.equal(s.rage,4);
});
test('combat log explains actual shield and life damage and enemy turns',()=>{
 let s=battle('sword');s.hand=[card('roll','a')];s.enemies[0].shield=4;
 s=playCard(s,'a','e0');assert(s.log.some(x=>x.includes('掉血2')&&x.includes('破盾4')));
 s=endTurn(s);assert(s.log.some(x=>x.includes('敌方行动')));assert(s.log.some(x=>x.includes('第2回合')));
 assert(s.log.some(x=>x.includes('受到')));assert(s.log.length<=30);
});
test('battle UI exposes forecast, pile counts and escaped log',()=>{
 const r=applyAction(createRun(7),{type:'START',sectId:'sword'});r.battle.hand=[card('roll','a')];r.battle.log=['<script>bad</script>'];
 const root={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null};render(root,r,{selectedUid:'a'},()=>{});
 for(const text of ['预计掉血6','抽牌堆','弃牌堆','放逐','战报','&lt;script&gt;'])assert(root.innerHTML.includes(text),text);
 assert(!root.innerHTML.includes('<script>bad'));
});
