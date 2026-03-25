import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  isAdminAuthConfigured,
  setAdminSessionCookie,
  validateAdminCredentials,
} from '@/lib/adminAuth';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Admin login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET in .env.local and restart the server.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;
    const valid = validateAdminCredentials(username, password);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await setAdminSessionCookie(username);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json(
      { success: false, error: 'Admin login configuration error' },
      { status: 500 }
    );
  }
}
