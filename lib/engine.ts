import {lessons,endpoints,labs} from './curriculum';
export type Trace={method:string;path:string;actor:string;mode:string;status:number;body:string;query:string;at:string};
export type LabProgress={attempts:number;hint:number;completed:boolean;xp:number;traces:Trace[];completedAt?:string;verifiedTraces?:Trace[]};
export type Finding={id:string;title:string;asset:string;endpoint:string;parameter:string;type:string;severity:string;description:string;steps:string;evidence:string;impact:string;remediation:string;status:string;createdAt:string;report:boolean};
export type State={setup:boolean[];skipped:boolean;lessons:string[];labs:Record<string,LabProgress>;findings:Finding[];recon:Record<string,string>;activity:string[];messages:{role:string;text:string}[]};
export type Action={type:string;[key:string]:any};
export function newState():State {return {setup:Array(7).fill(false),skipped:false,lessons:[],labs:Object.fromEntries(labs.map(l=>[l.id,{attempts:0,hint:0,completed:false,xp:0,traces:[]}])),findings:[],recon:{},activity:[],messages:[]};}
export function ready(s:State){return s.skipped||s.setup.every(Boolean);}
export function xp(s:State){return Object.values(s.labs).reduce((n,l)=>n+l.xp,0);}
export function score(h:number){return Math.max(25,100-h*15-(h===4?15:0));}
export const hints:Record<string,string[]>={
 http:['Find the input that changes what the server returns.','Compare two GET requests with different q values. Inspect both status and body.','Send /api/search?q=keyboard and /api/search?q=laptop. The method is GET; the parameter is q.','The response is JSON with status 200. Two distinct q values demonstrate a controlled comparison. Submit GET, q, and 200.'],
 idor:['Establish who owns each private record before testing.','Capture Alex’s order 101 and Jordan’s order 202 under their own identities.','Keep Alex signed in and request /api/orders/202. Compare the returned owner with Jordan’s baseline.','In training mode, Alex can read Jordan’s private order 202. This proves missing authorization in this simulation. Protected mode returns 403. Submit Confirmed vulnerability after all three baselines.'],
 reflection:['Send one unique, harmless marker and inspect where it appears.','Compare raw HTML output with escaped output using the same marker.','Try FORGE<42> in raw and escaped modes. Compare < with &lt;.','Raw reflection is a lead, not proof of XSS. The escaped output treats special characters as data. Submit Reflection only after comparing both modes; this simulation does not execute scripts.']
};
function str(v:unknown,max=5000){if(typeof v!=='string'||v.length>max)throw new Error('Enter a valid value within the length limit.');return v.trim();}
export function simulate(a:Action):Trace {
 const method=str(a.method,8),path=str(a.path,250),actor=str(a.actor,10),mode=str(a.mode,20);
 if(!['GET','POST','PUT','DELETE'].includes(method)||!['Alex','Jordan'].includes(actor)||!['training','protected','raw','escaped'].includes(mode))throw new Error('Invalid request configuration.');
 if(!path.startsWith('/')||path.startsWith('//')||path.includes('://'))throw new Error('Use a relative endpoint inside this fictional lab.');
 const u=new URL(path,'https://lab.bugforge.local');const query=u.searchParams.get('q')||'';
 let status=200,body='';
 if(method!=='GET'){status=405;body='{"error":"This exercise only supports GET"}';}
 else if(a.lab==='http'&&u.pathname==='/api/search'){const items=['Keyboard','Laptop','Mouse','Monitor'].filter(x=>x.toLowerCase().includes(query.toLowerCase()));body=JSON.stringify({query,results:items},null,2);}
 else if(a.lab==='idor'&&/^\/api\/orders\/(101|202)$/.test(u.pathname)){
 const id=Number(u.pathname.split('/').pop());const owner=id===101?'Alex':'Jordan';
 if(mode==='protected'&&owner!==actor){status=403;body='{"error":"You do not own this private order"}';}
 else body=JSON.stringify({id,owner,visibility:'private',item:id===101?'Keyboard':'Monitor',privateMarker:id===101?'A-ONLY-101':'B-ONLY-202'},null,2);
 } else if(a.lab==='reflection'&&u.pathname==='/search'){
 const escaped=query.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 body='<p>Search: '+(mode==='escaped'?escaped:query)+'</p>';
 } else {status=404;body='{"error":"Endpoint not available in this exercise"}';}
 return {method,path,actor,mode,status,body,query,at:new Date().toISOString()};
}
export function applyAction(original:State,a:Action){const s:State=structuredClone(original);let result:any={};
 const touch=()=>{const date=new Date().toISOString().slice(0,10);if(!s.activity.includes(date))s.activity.push(date);s.activity=s.activity.slice(-366);};
 if(a.type==='setup'){if(!Number.isInteger(a.index)||a.index<0||a.index>6||typeof a.checked!=='boolean')throw new Error('Invalid setup step.');s.setup[a.index]=a.checked;touch();}
 else if(a.type==='skip'){s.skipped=true;touch();}
 else if(a.type==='lesson'){const l=lessons.find(x=>x.id===a.id);if(!l||a.answer!==l.answer)throw new Error('Not quite. Review the example and try again.');if(!s.lessons.includes(l.id))s.lessons.push(l.id);touch();result.message='Concept checked. Take it into a lab.';}
 else if(['request','hint','submit'].includes(a.type)){
  if(!ready(s))throw new Error('Finish the setup self-check or explicitly skip it before starting a lab.');
  if(!labs.some(l=>l.id===a.lab))throw new Error('Lab not found.');
  const l=s.labs[a.lab];
  if(a.type==='request'){const t=simulate(a);l.traces=[...l.traces,t].slice(-30);l.attempts++;result.trace=t;touch();}
  if(a.type==='hint'){l.hint=Math.min(4,l.hint+1);result.hint=hints[a.lab][l.hint-1];}
  if(a.type==='submit'){
   const traces=l.traces.filter(t=>t.status===200&&t.method==='GET');let valid=false;
   if(a.lab==='http')valid=new Set(traces.map(t=>t.query).filter(Boolean)).size>=2&&a.answer==='GET|q|200';
   if(a.lab==='idor')valid=traces.some(t=>t.actor==='Alex'&&/\/101$/.test(t.path)&&t.body.includes('A-ONLY-101'))&&traces.some(t=>t.actor==='Jordan'&&/\/202$/.test(t.path)&&t.body.includes('B-ONLY-202'))&&traces.some(t=>t.actor==='Alex'&&/\/202$/.test(t.path)&&t.body.includes('B-ONLY-202'))&&l.traces.some(t=>t.actor==='Alex'&&/\/202$/.test(t.path)&&t.mode==='protected'&&t.status===403)&&a.answer==='confirmed';
   if(a.lab==='reflection')valid=traces.some(t=>t.mode==='raw'&&t.query.length>=5&&/[<>]/.test(t.query)&&traces.some(u=>u.mode==='escaped'&&u.query===t.query&&u.body!==t.body))&&a.answer==='reflection-only';
   if(!valid)throw new Error('The evidence is not complete yet. Check the objective, keep your baseline requests, and review your conclusion.');
   if(!l.completed){l.completed=true;l.xp=score(l.hint);l.completedAt=new Date().toISOString();l.verifiedTraces=structuredClone(l.traces);touch();result.message='Evidence verified in this simulation. +'+l.xp+' XP';}else result.message='Already completed. Your original XP award is unchanged.';
  }
 }else if(a.type==='finding'){
  if(!s.labs.idor.completed)throw new Error('Verify the Access Control exercise before creating its finding.');
  if(s.findings.some(f=>f.id==='idor-training'))return {state:s,result:{message:'This finding is already saved.'}};
  const l=s.labs.idor;
  s.findings.push({id:'idor-training',title:'Missing ownership check exposes another user’s private order',asset:'ShopSphere · BugForge simulation',endpoint:'/api/orders/202',parameter:'order ID',type:'Broken access control / IDOR',severity:'Medium · training assessment',description:'Alex can retrieve Jordan’s private order by changing the order identifier while keeping Alex’s identity unchanged.',steps:'1. As Alex, GET /api/orders/101 and record the owner baseline.\n2. As Jordan, GET /api/orders/202 and record the second owner baseline.\n3. As Alex, GET /api/orders/202 in training mode.\n4. Observe Jordan’s private marker in the successful response.\n5. Compare with protected mode, which denies cross-account access.',evidence:(l.verifiedTraces||[]).map(t=>t.actor+' → '+t.path+' → '+t.status+'\n'+t.body).join('\n\n').slice(0,12000),impact:'In this fictional scenario, one authenticated customer can read another customer’s private order. No claim is made about real systems or broader data access.',remediation:'Enforce server-side ownership checks on every order read. Deny by default and test cross-user access. Unpredictable IDs alone are not a fix.',status:'Confirmed in simulation',createdAt:new Date().toISOString(),report:false});touch();result.message='Finding saved with its lab evidence.';
 }else if(a.type==='report'){
  const f=s.findings.find(f=>f.id===a.id);if(!f)throw new Error('Finding not found.');
  for(const k of ['title','description','steps','impact','remediation'] as const){if(a[k]!==undefined)f[k]=str(a[k],5000);}
  if(!f.title||!f.steps||!f.impact)throw new Error('Add a title, reproduction steps, and evidence-based impact.');f.report=true;touch();result.message='Report draft saved.';
 }else if(a.type==='recon'){
  if(!endpoints.includes(a.endpoint)||!['Unreviewed','Interesting','Investigating','Tested','Potential issue','False positive'].includes(a.status))throw new Error('Invalid endpoint status.');
  s.recon[a.endpoint]=a.status;touch();
 }else throw new Error('Unknown action.');
 return {state:s,result};
}
export function streak(s:State){let count=0;const d=new Date();if(!s.activity.includes(d.toISOString().slice(0,10)))d.setUTCDate(d.getUTCDate()-1);while(s.activity.includes(d.toISOString().slice(0,10))){count++;d.setUTCDate(d.getUTCDate()-1);}return count;}
