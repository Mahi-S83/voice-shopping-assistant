import cors from 'cors';

// This middleware handles Cross-Origin Resource Sharing
// It allows your frontend to talk to the backend

const corsOptions = {
  // Only allow requests from your frontend
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allow these HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Allow these headers
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);