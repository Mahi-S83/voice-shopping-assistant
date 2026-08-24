import OpenAI from 'openai';

// Initialize Groq client
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ No API key found!');
      return new OpenAI({ apiKey: 'dummy' });
    }
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined,
    });
  }
  return client;
}

export interface SearchEntities {
  query: string;
  brand?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  size?: string | null;
  organic?: boolean;
}

export interface SearchIntent {
  intent: 'SEARCH_PRODUCT';
  entities: SearchEntities;
}

export class SearchParser {
  async parseSearchQuery(text: string): Promise<SearchIntent> {
    try {
      console.log(`🔍 Parsing search: "${text}"`);

      const response = await getClient().chat.completions.create({
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          {
            role: "user",
            content: `Search query: "${text}"`,
          },
        ],
        temperature: 0,
        max_tokens: 200,
        reasoning_effort: "none",
      });

      const content = response.choices[0].message.content || '{}';
      console.log(`📤 Search Response: ${content}`);

      let cleanContent = content
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanContent);
      
      return {
        intent: 'SEARCH_PRODUCT',
        entities: {
          query: parsed.entities?.query || text,
          brand: parsed.entities?.brand || null,
          minPrice: parsed.entities?.minPrice || null,
          maxPrice: parsed.entities?.maxPrice || null,
          size: parsed.entities?.size || null,
          organic: parsed.entities?.organic || false,
        },
      };
    } catch (error) {
      console.error('❌ Search parse error:', error);
      // Fallback: treat the whole text as query
      return {
        intent: 'SEARCH_PRODUCT',
        entities: {
          query: text,
          brand: null,
          minPrice: null,
          maxPrice: null,
          size: null,
          organic: false,
        },
      };
    }
  }
private getSystemPrompt(): string {
  return `You are a shopping search intent parser.

Convert the user's natural-language shopping search into JSON.

Return ONLY valid JSON.

Schema:
{
  "intent": "SEARCH_PRODUCT",
  "entities": {
    "query": "string (the main product name)",
    "brand": null or string,
    "minPrice": null or number,
    "maxPrice": null or number,
    "size": null or string,
    "organic": false or true
  }
}

Examples:
"find organic apples" → {"intent":"SEARCH_PRODUCT","entities":{"query":"apples","brand":null,"minPrice":null,"maxPrice":null,"size":null,"organic":true}}

"find Amul milk" → {"intent":"SEARCH_PRODUCT","entities":{"query":"milk","brand":"Amul","minPrice":null,"maxPrice":null,"size":null,"organic":false}}

"milk under 40 rupees" → {"intent":"SEARCH_PRODUCT","entities":{"query":"milk","brand":null,"minPrice":null,"maxPrice":40,"size":null,"organic":false}}

"toothpaste under ₹200" → {"intent":"SEARCH_PRODUCT","entities":{"query":"toothpaste","brand":null,"minPrice":null,"maxPrice":200,"size":null,"organic":false}}

"organic rice between ₹100 and ₹300" → {"intent":"SEARCH_PRODUCT","entities":{"query":"rice","brand":null,"minPrice":100,"maxPrice":300,"size":null,"organic":true}}

"500g Tata salt" → {"intent":"SEARCH_PRODUCT","entities":{"query":"salt","brand":"Tata","minPrice":null,"maxPrice":null,"size":"500g","organic":false}}

"find milk under 40" → {"intent":"SEARCH_PRODUCT","entities":{"query":"milk","brand":null,"minPrice":null,"maxPrice":40,"size":null,"organic":false}}

Return ONLY JSON. No explanation.`;
}
}

export const searchParser = new SearchParser();