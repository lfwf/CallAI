import { NextResponse } from 'next/server';
import { verifyAdminAccount } from '@/lib/auth/simple-auth';

export async function POST(request) {
  const { username, password } = await request.json();

  if (!verifyAdminAccount(username, password)) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('callai_admin', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return response;
}
