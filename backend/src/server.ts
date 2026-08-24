// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
import { catalogService } from './services/catalogService';


// Force load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Check if loaded
console.log('🔍 Environment check:');
catalogService.loadCatalog();
console.log(`📦 Catalog: ${catalogService.getProductCount()} products loaded`);
console.log('  GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Present' : '❌ Missing');
console.log('  PORT:', process.env.PORT);
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Now import the rest
import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Server is running!');
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  
  console.log('\n🔧 Middleware Status:');
  console.log('  ✅ CORS enabled');
  console.log('  ✅ Helmet security enabled');
  console.log('  ✅ Rate limiting enabled');
  console.log(`  ✅ ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000)} seconds`);
  
  console.log('\n🔑 API Keys:');
  if (process.env.GROQ_API_KEY) {
    console.log('  ✅ Groq API Key: Configured (Free)');
 console.log(`  📝 Using model: qwen/qwen3.6-27b`);
    console.log('  ✅ OpenAI API Key: Configured');
  } else if (process.env.ANTHROPIC_API_KEY) {
    console.log('  ✅ Anthropic API Key: Configured');
  } else {
    console.log('  ❌ No API Key Found! Please add GROQ_API_KEY or OPENAI_API_KEY to .env');
  }
  
  console.log('\n✨ Server ready for requests');
  console.log('='.repeat(50));
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});