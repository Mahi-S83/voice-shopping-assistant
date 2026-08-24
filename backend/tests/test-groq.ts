import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function testGroq() {
  try {
    console.log('🧪 Testing Groq API with model: qwen/qwen3.6-27b\n');
    
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Say hello and confirm you're working!",
        },
      ],
     model: "qwen/qwen3.6-27b",  // <-- TESTING THIS MODEL   // <-- TESTING THIS MODEL
    });

    console.log('✅ SUCCESS!');
    console.log('📝 Response:', completion.choices[0].message.content);
    
  } catch (error: any) {
    console.error('❌ FAILED:');
    console.error('  Message:', error.message);
    if (error.status) console.error('  Status Code:', error.status);
  }
}

testGroq();