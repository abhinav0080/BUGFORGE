import {env} from 'cloudflare:workers';
import {newState,type State} from '@/lib/engine';
export function database(){if(!env.DB)throw new Error('Progress storage is unavailable.');return env.DB;}
export async function readState(userId:string){const db=database();await db.prepare('INSERT OR IGNORE INTO learner_state (user_id,data,revision) VALUES (?, ?, 0)').bind(userId,JSON.stringify(newState())).run();const row=await db.prepare('SELECT data,revision FROM learner_state WHERE user_id = ?').bind(userId).first<{data:string;revision:number}>();if(!row)throw new Error('Could not load progress.');return {state:JSON.parse(row.data) as State,revision:row.revision};}
export async function saveState(userId:string,state:State,revision:number){const r=await database().prepare('UPDATE learner_state SET data = ?, revision = revision + 1 WHERE user_id = ? AND revision = ?').bind(JSON.stringify(state),userId,revision).run();return r.meta.changes===1;}
