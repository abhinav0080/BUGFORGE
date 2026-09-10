const assert=require('node:assert/strict');
const base='http://127.0.0.1:5173';
(async()=>{
 let count=0;
 const check=(name)=>{count++;console.log('PASS '+name);};
 assert.equal((await fetch(base+'/')).status,200);
 assert.equal((await fetch(base+'/welcome')).status,200);check('Dashboard and landing render');
 assert.equal((await fetch(base+'/api/state')).status,401);
 assert.equal((await fetch(base+'/api/state',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'spoof@example.test'}})).status,401);check('Anonymous and spoofed identity rejected');
 const sign=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});assert.equal(sign.status,302);const cookie=sign.headers.get('set-cookie').split(';')[0];
 const headers={'Content-Type':'application/json',Cookie:cookie};
 let current=await (await fetch(base+'/api/state',{headers})).json();assert.ok(current.state);check('Local sign-in loads persistent account state');
 async function post(action,expected=200){const response=await fetch(base+'/api/state',{method:'POST',headers,body:JSON.stringify({...action,revision:current.revision})});const d=await response.json();assert.equal(response.status,expected,JSON.stringify(d));if(expected===200)current=d;return d;}
 const stale=current.revision;
 await post({type:'skip'});
 const conflict=await fetch(base+'/api/state',{method:'POST',headers,body:JSON.stringify({type:'skip',revision:stale})});assert.equal(conflict.status,409);check('Stale revision cannot overwrite progress');
 const responses=await Promise.all([0,1].map(()=>fetch(base+'/api/state',{method:'POST',headers,body:JSON.stringify({type:'skip',revision:current.revision})})));assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);current=await (await fetch(base+'/api/state',{headers})).json();check('Concurrent writes serialize with optimistic revision check');
 assert.equal((await fetch(base+'/api/state',{method:'POST',headers:{...headers,'Sec-Fetch-Site':'cross-site'},body:JSON.stringify({type:'skip',revision:current.revision})})).status,403);check('Cross-site writes denied');
 await post({type:'request',lab:'http',method:'GET',path:'/api/search?q=keyboard',actor:'Alex',mode:'training'});
 await post({type:'request',lab:'http',method:'GET',path:'/api/search?q=laptop',actor:'Alex',mode:'training'});
 await post({type:'submit',lab:'http',answer:'GET|q|200'});const earned=current.state.labs.http.xp;
 await post({type:'submit',lab:'http',answer:'GET|q|200'});assert.equal(current.state.labs.http.xp,earned);check('HTTP verification saves XP once');
 const reload=await (await fetch(base+'/api/state',{headers})).json();assert.equal(reload.state.labs.http.xp,earned);assert.ok(reload.state.skipped);check('Progress survives independent reload');
 await post({type:'report',id:'another-user-report'},400);await post({type:'mentor',message:'Cookie: private-session-value'},400);check('Unowned reports and sensitive mentor input rejected');
 await post({type:'mentor',message:'What should I do next?'});assert.ok(current.result.provider.includes('rule-based'));assert.ok(current.state.messages.at(-1).text.includes('HTTP Basics'));check('Guided mentor response is stored and honestly labeled');
 const scoped=await (await fetch(base+'/api/state?userId=another-user',{headers})).json();assert.equal(scoped.revision,current.revision);check('Client user selector cannot switch account state');
 console.log(count+' API integration checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
