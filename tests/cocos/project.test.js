import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync,existsSync,mkdtempSync,cpSync,rmSync} from 'node:fs';import {fileURLToPath} from 'node:url';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const project=fileURLToPath(new URL('../../cocos-first-pass/',import.meta.url));
function read(base,path){assert.ok(existsSync(join(base,path)),`missing ${path}`);return JSON.parse(readFileSync(join(base,path),'utf8'));}
function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(path,e.name)):[join(path,e.name)]);}
function check(base){
 const pkg=read(base,'package.json');assert.equal(pkg.creator.version,'3.8.8');
 const objects=read(base,'assets/scenes/Main.scene'),meta=read(base,'assets/scenes/Main.scene.meta'),script=read(base,'assets/scripts/ui/FirstPassApp.ts.meta');
 assert.equal(meta.importer,'scene');assert.ok(objects.some(o=>o.__type__==='cc.Canvas'));assert.ok(objects.some(o=>o.__type__==='cc.Camera'));
 const hex=script.uuid.replaceAll('-',''),alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let id=hex.slice(0,5);for(let i=5;i<32;i+=3){const n=parseInt(hex.slice(i,i+3),16);id+=alphabet[n>>6]+alphabet[n&63];}
 assert.ok(objects.some(o=>o.__type__===id),'entry script must be attached by its real compressed UUID');
 function visit(o){if(!o||typeof o!=='object')return;if('__id__'in o)assert.ok(Number.isInteger(o.__id__)&&o.__id__>=0&&o.__id__<objects.length);assert.ok(!('__uuid__'in o),'minimal scene must not reference missing external textures/fonts');Object.values(o).forEach(visit);}objects.forEach(visit);
 const uuids=new Set();for(const file of walk(join(base,'assets'))){
  if(file.endsWith('.meta')){const m=JSON.parse(readFileSync(file,'utf8'));assert.ok(!uuids.has(m.uuid));uuids.add(m.uuid);assert.ok(existsSync(file.slice(0,-5)));}
  else if(file.endsWith('.ts')||file.endsWith('.scene'))assert.ok(existsSync(file+'.meta'),file);
 }
 const source=readFileSync(join(base,'assets/scripts/ui/FirstPassApp.ts'),'utf8');assert.match(source,/ccclass\('FirstPassApp'\)/);assert.match(source,/error\(/);
}
test('Cocos project scene has valid entry, references and unique metas',()=>check(project));
test('Cocos project can be resolved after copying into a Chinese path with spaces',()=>{
 const temp=mkdtempSync(join(tmpdir(),'梦里修仙 test ')),dest=join(temp,'可导入工程');try{cpSync(project,dest,{recursive:true});check(dest);}finally{rmSync(temp,{recursive:true,force:true});}
});
test('Cocos UI compiles against the official 3.8.8 engine declarations',()=>{
 const repo=fileURLToPath(new URL('../../',import.meta.url));
 const result=spawnSync(process.execPath,[join(repo,'node_modules/typescript/bin/tsc'),'-p',join(repo,'tests/cocos/tsconfig-ui.json')],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+result.stderr);
});
test('Cocos delivery explains importing and memory progress without accessing browser saves',()=>{
 const readme=readFileSync(join(project,'README.md'),'utf8'),validation=readFileSync(join(project,'VALIDATION.md'),'utf8');
 assert.match(readme,/3\.8\.8/);assert.match(readme,/Main\.scene/);assert.match(readme,/刷新会重开/);assert.match(validation,/待用户验收/);
 for(const file of walk(join(project,'assets/scripts')))if(file.endsWith('.ts'))assert.doesNotMatch(readFileSync(file,'utf8'),/localStorage|dream-cultivation-v1/);
 const ignore=readFileSync(join(project,'.gitignore'),'utf8');for(const dir of ['Library/','temp/','build/','node_modules/'])assert.ok(ignore.includes(dir));
});
