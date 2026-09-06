import { NextResponse } from 'next/server';

import { auth } from './auth';

export default auth((request) => {
  if (request.auth) return;

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.nextUrl);
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ['/', '/parent', '/api/phase1/:path*'],
};
