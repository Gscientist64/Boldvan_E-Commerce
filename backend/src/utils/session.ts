// backend/src/utils/session.ts
// HttpOnly session cookie helpers.
//
// The frontend (www.boldvanltd.com) and backend (boldvan-e-commerce-0943.onrender.com)
// are DIFFERENT sites, so the cookie must be SameSite=None + Secure in production
// to be sent on cross-site requests. In local dev (same host, http) we use
// SameSite=Lax and Secure=false so it still works over http://localhost.

import { Response } from 'express';

export const SESSION_COOKIE = 'boldvan_session';
export const SESSION_DAYS = 30;
export const SESSION_MAX_AGE_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

/** Sets the httpOnly session cookie carrying the JWT. */
export const setSessionCookie = (res: Response, token: string, isSecure: boolean): void => {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure, // true over https (prod)
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/'
  });
};

/** Clears the session cookie (logout). */
export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
};

/** Reads the session cookie value from a raw Cookie header (no cookie-parser dep). */
export const getTokenFromCookieHeader = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === SESSION_COOKIE) {
      const value = part.slice(eq + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
};
