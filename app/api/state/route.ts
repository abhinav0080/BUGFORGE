import {getChatGPTUser} from '@/app/chatgpt-auth';
import {readState,saveState} from '@/db/store';
import {applyAction,ready} from '@/lib/engine';
import {guidedMentor} from '@/lib/mentor';
export const dynamic='force-dynamic';
function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export async function GET(){const user=await getChatGPTUser();if(!user)return json({error:'Sign in to save your learning progress.'},401);try{return json(await readState(user.userId));}catch(error){console.error('Progress load failed',error);return json({error:'Progress storage is temporarily unavailable. Retry in a moment.'},503);}}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Sign in to continue.'},401);
 if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Cross-site action denied.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON.'},415);
 let a:any;try{const raw=await request.text();if(raw.length>20000)return json({error:'Request is too large.'},413);a=JSON.parse(raw);if(!a||typeof a.type!=='string'||!Number.isInteger(a.revision))throw new Error();}catch{return json({error:'Invalid action.'},400);}
 let current;try{current=await readState(user.userId);}catch(error){console.error('Progress load failed',error);return json({error:'Progress storage is temporarily unavailable. Your input has not been discarded.'},503);}
 if(a.revision!==current.revision)return json({...current,error:'Progress changed in another tab. Please retry.'},409);
 let next;
 try{
  if(a.type==='mentor'){
   if(typeof a.message!=='string'||!a.message.trim()||a.message.length>1200)throw new Error('Enter a question of up to 1,200 characters.');
   if(/(cookie|authorization|password|token|api[-_ ]?key)\s*[:=]\s*\S+/i.test(a.message))throw new Error('Remove credentials, cookies, and tokens before sharing your question.');
   const reply=await guidedMentor.respond(a.message,{setupReady:ready(current.state),completed:Object.values(current.state.labs).filter(l=>l.completed).length});
   const state=structuredClone(current.state);state.messages=[...state.messages,{role:'user',text:a.message},{role:'assistant',text:reply}].slice(-30);next={state,result:{reply,provider:guidedMentor.name}};
  }else next=applyAction(current.state,a);
 }catch(error){return json({error:error instanceof Error?error.message:'Could not complete this action.'},400);}
 try{if(!await saveState(user.userId,next.state,current.revision))return json({error:'Another action completed first. Reload your progress and retry.'},409);return json({...next,revision:current.revision+1});}
 catch(error){console.error('Progress save failed',error);return json({error:'Progress could not be saved. Your input is still here; please retry.'},503);}
}
