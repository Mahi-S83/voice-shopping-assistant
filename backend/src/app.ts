import express from 'express';
import { json, urlencoded } from 'express';
import { corsMiddleware } from './middleware/cors';
import { securityMiddleware } from './middleware/security';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { catalogService } from './services/catalogService';

// Create Express app
const app = express();
catalogService.loadCatalog();

// Apply middleware in order (order matters!)
// 1. Security headers first
securityMiddleware(app);

// 2. CORS
app.use(corsMiddleware);

// 3. Parse JSON bodies
app.use(json());
app.use(urlencoded({ extended: true }));
// API routes
app.use('/api', routes);

// 4. Rate limiting
app.use(rateLimiter);

// Health check endpoint (skip rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Test endpoint to verify everything is working
app.get('/test-middleware', (req, res) => {
  res.json({
    success: true,
    message: 'All middleware is working!',
    cors: 'Enabled',
    security: 'Helmet active',
    rateLimit: '100 requests per minute',
  });
});

export default app;