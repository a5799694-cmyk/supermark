import test from 'node:test';import assert from 'node:assert/strict';
import {characterArt,poseForAction,createPosePlayer} from '../src/character-art.js';
import {render} from '../src/view.js';import {createRun,applyAction} from '../src/run.js';
test('art resolves each sect and pose with clipped sprite viewport and safe fallback',()=>{
 for(const sect of ['sword','thunder','clone'])for(const pose of ['idle','cast','attack']){
  const html=characterArt(sect,pose);assert(html.includes('viewBox='));assert(html.includes(`assets/characters/${sect}.webp`));assert(html.includes(`data-pose="${pose}"`));
 }
 assert.equal(characterArt('legacy'),'');assert(characterArt('boss').includes('boss.webp'));
 assert.equal(poseForAction({type:'PLAY_CARD',cardId:'roll'}),'attack');assert.equal(poseForAction({type:'PLAY_CARD',cardId:'not-this'}),'cast');assert.equal(poseForAction({type:'END_TURN'}),'idle');
});
test('pose timers replace prior action and return to idle without changing combat',()=>{
 let current='idle',redraws=0,callbacks=new Map(),next=0;
 const player=createPosePlayer({setPose:p=>current=p,render:()=>redraws++,schedule:f=>{callbacks.set(++next,f);return next},cancel:id=>callbacks.delete(id)});
 player.play('attack');assert.equal(current,'attack');player.play('cast');assert.equal(callbacks.size,1);assert.equal(current,'cast');
 [...callbacks.values()][0]();assert.equal(current,'idle');assert.equal(redraws,1);player.reset();assert.equal(current,'idle');
});
test('selection and battle render approved art while legacy stays usable',()=>{
 const root={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null};render(root,createRun(7),{},()=>{});
 for(const s of ['sword','thunder','clone'])assert(root.innerHTML.includes(`assets/characters/${s}.webp`));
 const r=applyAction(createRun(7),{type:'START',sectId:'clone'});render(root,r,{actorPose:'cast'},()=>{});
 assert(root.innerHTML.includes('data-pose="cast"'));assert(root.innerHTML.includes('hero-art'));
 r.battle.enemies[0].type='boss';render(root,r,{},()=>{});assert(root.innerHTML.includes('assets/characters/boss.webp'));
});
test('runtime atlases exist with verified hashes and all viewports remain inside their image',async()=>{
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');const {CHARACTER_FRAMES}=await import('../src/character-art.js');
 const manifest=JSON.parse(readFileSync(new URL('../assets/characters/manifest.json',import.meta.url)));
 assert.equal(manifest.length,4);
 for(const entry of manifest){const bytes=readFileSync(new URL('../'+entry.file,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(entry.hasAlpha);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  const art=CHARACTER_FRAMES[entry.id];assert.deepEqual(art.size,[entry.width,entry.height]);
  for(const {box:[x,y,w,h]}of art.frames){assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=entry.width&&y+h<=entry.height);}
 }
});
