// backend/src/utils/rateLimits.ts
// Per-endpoint rate limiters for sensitive auth/OTP routes (layered on top of the
// global limiter in server.ts). Uses express-rate-limit v7.

import rateLimit from 'express-rate-limit';

const jsonMessage = (message: string) => ({ message });

// Login: 10 attempts / 15 min per IP (account lockout is handled separately)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many login attempts. Please try again in 15 minutes.')
});

// Registration / signup: 5 / hour per IP
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many signup attempts. Please try again later.')
});

// Password reset request: 5 / hour per IP (prevents email bombing)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many password reset requests. Please try again later.')
});

// Password reset completion: 10 / hour per IP
export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many reset attempts. Please try again later.')
});

// Google OAuth: 10 / 15 min per IP
export const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many sign-in attempts. Please try again later.')
});

// OTP send: 5 / hour per IP (prevents OTP email flooding)
export const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many OTP requests. Please try again later.')
});

// OTP verify: 10 / 15 min per IP (brute-force protection on the 6-digit code)
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many verification attempts. Please try again in 15 minutes.')
});
