import { NextResponse } from 'next/server';
import { sessionToken, SESSION_COOKIE } from '@/app/session-auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = 'guest-' + crypto.randomUUID();
  const response = NextResponse.redirect(new URL('/', url.origin));
  response.cookies.set(SESSION_COOKIE, await sessionToken(userId), {
    httpOnly: true, secure: url.protocol === 'https:', sameSite: 'lax',
    path: '/', maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
