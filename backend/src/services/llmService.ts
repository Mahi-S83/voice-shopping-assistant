import OpenAI from 'openai';

// Initialize Groq client (OpenAI-compatible)
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined,
});

export interface ActionSchema {
  intent: string;
  entities: Record<string, any>;
}

export async function parseIntent(text: string, language: string = 'en'): Promise<ActionSchema> {
  try {
    const response = await client.chat.completions.create({
     model: "qwen/qwen3.6-27b", // ✅ Correct model,
      messages: [
        {
          role: "system",
          content: `You are a shopping assistant. Parse the user's command and return JSON.
          
          Available intents: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, MARK_BOUGHT, SEARCH_PRODUCT, SHOW_LIST, GET_SUBSTITUTE, CLEAR_LIST
          
          Entities to extract: product, quantity, unit, brand, size, priceMin, priceMax, attributes[]
          
          Always return valid JSON only. Example:
          {"intent": "ADD_ITEM", "entities": {"product": "milk", "quantity": 2, "unit": "L"}}`
        },
        {
          role: "user",
          content: `Command: "${text}" (Language: ${language})`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ActionSchema;
  } catch (error) {
    console.error('LLM parse error:', error);
    // Fallback to regex parsing
    return fallbackParse(text);
  }
}

// Simple regex fallback parser
function fallbackParse(text: string): ActionSchema {
  const lower = text.toLowerCase();
  
  // Check for remove
  if (lower.includes('remove') || lower.includes('delete') || lower.includes('hatao')) {
    const match = lower.match(/(?:remove|delete|hatao)\s*(.+)/i);
    return {
      intent: 'REMOVE_ITEM',
      entities: { product: match?.[1]?.trim() || 'unknown' }
    };
  }
  
  // Check for add
  if (lower.includes('add') || lower.includes('need') || lower.includes('buy') || lower.includes('dalo')) {
    const match = lower.match(/(?:add|need|buy|dalo)\s*(.+)/i);
    return {
      intent: 'ADD_ITEM',
      entities: { product: match?.[1]?.trim() || 'unknown' }
    };
  }
  
  // Default
  return {
    intent: 'ADD_ITEM',
    entities: { product: text }
  };
}