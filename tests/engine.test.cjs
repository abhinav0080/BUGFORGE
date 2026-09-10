const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs'),ts=require('typescript');
for(const name of ['curriculum','engine','mentor']){
 const source=fs.readFileSync('lib/'+name+'.ts','utf8').replace("'./curriculum'","'./curriculum-tested.mjs'");
 const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 fs.writeFileSync('.sites-runtime/'+name+'-tested.mjs',output);
}
(async()=>{
 const e=await import(pathToFileURL(path.resolve('.sites-runtime/engine-tested.mjs')));
 const {guidedMentor}=await import(pathToFileURL(path.resolve('.sites-runtime/mentor-tested.mjs')));
 let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
 const unlocked=()=>e.applyAction(e.newState(),{type:'skip'}).state;
 const request=(s,lab,path,actor='Alex',mode='training',method='GET')=>e.applyAction(s,{type:'request',lab,path,actor,mode,method}).state;
 test('Setup gate rejects lab actions without progress changes',()=>{const s=e.newState();assert.throws(()=>request(s,'http','/api/search?q=a'));assert.equal(s.labs.http.attempts,0);});
 test('HTTP requires two distinct server-recorded requests and correct conclusion',()=>{let s=unlocked();s=request(s,'http','/api/search?q=keyboard');assert.throws(()=>e.applyAction(s,{type:'submit',lab:'http',answer:'GET|q|200'}));s=request(s,'http','/api/search?q=laptop');assert.throws(()=>e.applyAction(s,{type:'submit',lab:'http',answer:'POST|q|200'}));s=e.applyAction(s,{type:'submit',lab:'http',answer:'GET|q|200'}).state;assert.equal(e.xp(s),100);assert.equal(e.xp(e.applyAction(s,{type:'submit',lab:'http',answer:'GET|q|200'}).state),100);});
 test('Incorrect endpoints, external URLs, and invalid lab IDs cannot earn XP',()=>{let s=unlocked();assert.throws(()=>request(s,'http','https://example.com'));assert.throws(()=>request(s,'__proto__','/api/search?q=a'));s=request(s,'http','/wrong?q=one');s=request(s,'http','/wrong?q=two');assert.throws(()=>e.applyAction(s,{type:'submit',lab:'http',answer:'GET|q|200'}));});
 let verified;
 test('IDOR requires both owner baselines, cross-user disclosure, and protected control',()=>{let s=unlocked();s=request(s,'idor','/api/orders/202');assert.throws(()=>e.applyAction(s,{type:'submit',lab:'idor',answer:'confirmed'}));s=request(s,'idor','/api/orders/101');s=request(s,'idor','/api/orders/202','Jordan');assert.throws(()=>e.applyAction(s,{type:'submit',lab:'idor',answer:'confirmed'}));s=request(s,'idor','/api/orders/202','Alex','protected');assert.equal(s.labs.idor.traces.at(-1).status,403);assert.ok(!s.labs.idor.traces.at(-1).body.includes('B-ONLY'));verified=e.applyAction(s,{type:'submit',lab:'idor',answer:'confirmed'}).state;assert.equal(verified.labs.idor.completed,true);});
 test('Verified evidence remains stable after later attempts and is attached to finding',()=>{const snapshot=JSON.stringify(verified.labs.idor.verifiedTraces);let s=verified;for(let i=0;i<35;i++)s=request(s,'idor','/wrong');assert.equal(JSON.stringify(s.labs.idor.verifiedTraces),snapshot);s=e.applyAction(s,{type:'finding'}).state;assert.ok(s.findings[0].evidence.includes('B-ONLY-202'));assert.ok(s.findings[0].evidence.includes('403'));assert.equal(e.applyAction(s,{type:'finding'}).state.findings.length,1);});
 test('Reflection checks same marker and distinguish inert output from XSS',()=>{let s=unlocked();s=request(s,'reflection','/search?q=FORGE%3C42%3E','Alex','raw');s=request(s,'reflection','/search?q=FORGE%3C99%3E','Alex','escaped');assert.throws(()=>e.applyAction(s,{type:'submit',lab:'reflection',answer:'reflection-only'}));s=request(s,'reflection','/search?q=FORGE%3C42%3E','Alex','escaped');assert.ok(s.labs.reflection.traces.at(-1).body.includes('&lt;'));assert.throws(()=>e.applyAction(s,{type:'submit',lab:'reflection',answer:'xss'}));assert.equal(e.applyAction(s,{type:'submit',lab:'reflection',answer:'reflection-only'}).state.labs.reflection.completed,true);});
 test('Hints persist and solution limits award to 25 XP',()=>{let s=unlocked();for(let i=0;i<5;i++)s=e.applyAction(s,{type:'hint',lab:'http'}).state;assert.equal(s.labs.http.hint,4);s=request(s,'http','/api/search?q=one');s=request(s,'http','/api/search?q=two');s=e.applyAction(s,{type:'submit',lab:'http',answer:'GET|q|200'}).state;assert.equal(s.labs.http.xp,25);assert.deepEqual([0,1,2,3,4].map(e.score),[100,85,70,55,25]);});
 test('Pure action engine never mutates another learner’s state',()=>{const first=unlocked(),second=unlocked();const changed=request(first,'http','/api/search?q=one');assert.equal(second.labs.http.attempts,0);assert.equal(first.labs.http.attempts,0);assert.equal(changed.labs.http.attempts,1);});
 test('Report writes require an owned finding and mandatory evidence-based fields',()=>{assert.throws(()=>e.applyAction(unlocked(),{type:'report',id:'another-user'}));let s=e.applyAction(verified,{type:'finding'}).state;assert.throws(()=>e.applyAction(s,{type:'report',id:'idor-training',title:''}));s=e.applyAction(s,{type:'report',id:'idor-training',title:'Training IDOR report'}).state;assert.equal(s.findings[0].report,true);});
 const originalFetch=global.fetch;global.fetch=()=>{throw new Error('Unexpected remote call');};
 const reply=await guidedMentor.respond('What should I do next?',{setupReady:false,completed:0});assert.ok(reply.includes('build your lab'));assert.ok(guidedMentor.name.includes('rule-based'));global.fetch=originalFetch;count++;console.log('PASS Guided mentor uses no external model requests');
 console.log(count+' meaningful checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
