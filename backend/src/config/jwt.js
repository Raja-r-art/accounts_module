'use strict';

module.exports = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
