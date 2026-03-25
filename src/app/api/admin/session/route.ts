import { NextResponse } from 'next/server';
import { getAdminSessionFromCookies, isAdminAuthConfigured } from '@/lib/adminAuth';

export async function GET() {
  try {
    const configured = isAdminAuthConfigured();
    const session = await getAdminSessionFromCookies();

    if (!session) {
      return NextResponse.json(
        { success: true, authenticated: false, configured },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        configured,
        user: session.sub,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: true, authenticated: false, configured: false }, { status: 200 });
  }
}
