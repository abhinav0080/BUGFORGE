import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';

const COOKIE = 'bugforge_session';
const encoder = new TextEncoder();
function secret(): string {
  const s = (env as unknown as { SESSION_SECRET?: string }).SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be configured with at least 32 characters.');
  return s;
}
async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
}
export async function sessionToken(userId: string): Promise<string> {
  return userId + '.' + await sign(userId);
}
export async function getSessionUser(): Promise<{userId:string;email:string;fullName:string|null}|null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const split = token.lastIndexOf('.');
  if (split < 0) return null;
  const userId = token.slice(0, split);
  const signature = token.slice(split + 1);
  if (!/^guest-[0-9a-f-]{36}$/.test(userId) || !/^[0-9a-f]{64}$/.test(signature)) return null;
  const expected = await sign(userId);
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (diff) return null;
  return {userId,email:'',fullName:'Researcher'};
}
export const SESSION_COOKIE = COOKIE;
