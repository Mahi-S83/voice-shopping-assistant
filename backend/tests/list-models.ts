import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function listModels() {
  try {
    console.log('📋 Fetching available models...\n');
    const models = await client.models.list();
    
    console.log('✅ Available models:');
    models.data.forEach((model: any) => {
      console.log(`  - ${model.id}`);
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listModels();