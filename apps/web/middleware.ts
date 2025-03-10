import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/profile', '/dashboard'],
};
