import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const rateLimiter = rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  // Fix: Use the built-in key generator
  keyGenerator: (req) => {
    // Use the built-in IP generator that handles IPv6
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});