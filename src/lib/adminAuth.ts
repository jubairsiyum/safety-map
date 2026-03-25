import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

type AdminSessionPayload = {
  sub: string;
  exp: number;
};

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !secret) {
    return null;
  }

  return { username, password, secret };
}

export function isAdminAuthConfigured() {
  return getAdminConfig() !== null;
}

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function secureEquals(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuf, bBuf);
}

function createSessionToken(username: string, secret: string) {
  const payload: AdminSessionPayload = {
    sub: username,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string, secret: string): AdminSessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const expected = sign(encodedPayload, secret);

  if (!secureEquals(signature, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AdminSessionPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAdminConfig();
  if (!config) {
    return false;
  }

  return secureEquals(username, config.username) && secureEquals(password, config.password);
}

export async function setAdminSessionCookie(username: string) {
  const config = getAdminConfig();
  if (!config) {
    throw new Error(
      'Missing admin auth env vars. Please set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.'
    );
  }

  const { secret } = config;
  const token = createSessionToken(username, secret);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getAdminSessionFromCookies() {
  const config = getAdminConfig();
  if (!config) {
    return null;
  }

  const { secret } = config;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token, secret);
}

export function getAdminSessionFromRequest(request: NextRequest) {
  const config = getAdminConfig();
  if (!config) {
    return null;
  }

  const { secret } = config;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token, secret);
}
