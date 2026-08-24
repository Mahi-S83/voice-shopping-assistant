import helmet from 'helmet';
import { Express } from 'express';

// Helmet adds security headers to all responses
// This helps prevent common web vulnerabilities

export const securityMiddleware = (app: Express) => {
  // Use helmet with default settings
  app.use(helmet());
  
  // But we want to customize Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        // Only allow our own domain for scripts
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        // Allow connections to our API
        connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173'],
      },
    })
  );
  
  // Remove X-Powered-By header (security through obscurity)
  app.disable('x-powered-by');
};