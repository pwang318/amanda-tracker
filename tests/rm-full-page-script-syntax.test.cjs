'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const rg=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
let m,inline=0,external=0;
while((m=rg.exec(html))){
 const attrs=m[1],code=m[2].trim();
 if(/\bsrc\s*=/.test(attrs)){
  const src=attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if(src&&src.startsWith('./')){
   const file=src.split('?')[0];
   assert(fs.existsSync(path.resolve(file)),'Missing local script '+file);
  }
  external++;continue;
 }
 if(!code||/\btype\s*=\s*["']?(?:application\/json|importmap)/i.test(attrs))continue;
 try{new vm.Script(code,{filename:'index.html inline '+inline})}
 catch(e){throw new Error('Invalid inline script '+inline+' at HTML offset '+m.index+': '+e.message)}
 inline++;
}
assert(inline>100,'Expected substantial inline dashboard scripts to be covered');
for(const f of ['ui/daily-execution-coaching.js','ui/fast-activity-workflow.js','ui/compact-workspace.js','ui/scorecard-source-summary.js']){
 new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});
}
console.log('Tracker HTML and local scripts syntax PASS ('+inline+' inline, '+external+' external script tags)');
