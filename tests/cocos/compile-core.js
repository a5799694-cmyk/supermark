import {mkdtempSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const repo=fileURLToPath(new URL('../../',import.meta.url));
let compiled;
export function loadCore(name){
 const source=join(repo,'cocos-first-pass/assets/scripts',name+'.ts');
 assert.ok(existsSync(source),`Missing migration module: ${name}`);
 if(!compiled){
  compiled=mkdtempSync(join(tmpdir(),'dream-cocos-core-'));
  writeFileSync(join(compiled,'package.json'),' {"type":"commonjs"}');
  const result=spawnSync(process.execPath,[join(repo,'node_modules/typescript/bin/tsc'),'-p',join(repo,'tests/cocos/tsconfig.json'),'--outDir',compiled],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
  process.on('exit',()=>rmSync(compiled,{recursive:true,force:true}));
 }
 return createRequire(import.meta.url)(join(compiled,name+'.js'));
}
