import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';import vm from 'node:vm';import ts from 'typescript';
// The engine is unavailable here. Run the actual app's start method with only
// its external engine boundary substituted; stop before any UI construction.
function probe(camera){
 const source=readFileSync(fileURLToPath(new URL('../../cocos-first-pass/assets/scripts/ui/FirstPassApp.ts',import.meta.url)),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2019,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText;
 class Canvas{}class UITransform{}class Component{}
 const diagnostics=[],mod={exports:{}};
 const cc={Canvas,UITransform,Component,_decorator:{ccclass:()=>c=>c},ResolutionPolicy:{SHOW_ALL:0},error:m=>diagnostics.push(m),view:{setDesignResolutionSize:()=>{throw Error('engine rendering boundary');}}};
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:id=>id==='cc'?cc:{}});
 const app=new mod.exports.FirstPassApp();app.getComponent=c=>c===Canvas?{cameraComponent:camera}:{};
 return {app,diagnostics};
}
test('Cocos startup diagnoses missing disabled inactive or destroyed UI camera before rendering',()=>{
 for(const camera of [null,{enabled:false,isValid:true,node:{activeInHierarchy:true}},{enabled:true,isValid:true,node:{activeInHierarchy:false}},{enabled:true,isValid:false,node:{activeInHierarchy:true}}]){
  const {app,diagnostics}=probe(camera);assert.doesNotThrow(()=>app.start());assert.equal(diagnostics.length,1);assert.match(diagnostics[0],/UICamera_Canvas/);assert.match(diagnostics[0],/Main\.scene/);
 }
});
test('Cocos startup with a valid UI camera proceeds to the engine boundary',()=>{
 const {app,diagnostics}=probe({enabled:true,isValid:true,node:{activeInHierarchy:true}});assert.throws(()=>app.start(),/engine rendering boundary/);assert.deepEqual(diagnostics,[]);
});
