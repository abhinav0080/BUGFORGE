import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/app/session-auth';
export function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(SESSION_COOKIE, '', { httpOnly:true, path:'/', maxAge:0 });
  return response;
}
