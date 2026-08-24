import OpenAI from 'openai';
import { catalogService } from './catalogService';
import { listService, ListItem } from './listService';

// Initialize Groq client (lazy initialization)
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ No API key found! Please set GROQ_API_KEY or OPENAI_API_KEY in .env');
      return new OpenAI({
        apiKey: 'dummy',
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    
    console.log(`🔑 Using API: ${process.env.GROQ_API_KEY ? 'Groq' : 'OpenAI'}`);
    
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined,
    });
  }
  return client;
}

// Types for parsing
export interface ParsedIntent {
  intent: IntentType;
  entities: ParsedEntities;
  confidence?: number;
  rawText?: string;
}

export type IntentType = 
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'REMOVE_MULTIPLE'
  | 'UPDATE_QUANTITY'
  | 'MARK_BOUGHT'
  | 'SEARCH_PRODUCT'
  | 'SHOW_LIST'
  | 'GET_SUBSTITUTE'
  | 'CLEAR_LIST'
  | 'UNKNOWN';

export interface ParsedItem {
  product: string;
  quantity: number;
  unit: string;
}

export interface ParsedEntities {
  product?: string;
  quantity?: number;
  unit?: string;
  items?: ParsedItem[];
  brand?: string;
  size?: string;
  priceMin?: number;
  priceMax?: number;
  products?: string[];
  itemId?: string;
}

// Result of executing an intent
export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class IntentParser {
  // Parse text using Groq LLM
  async parseText(text: string, language: string = 'en'): Promise<ParsedIntent> {
    try {
      console.log(`🧠 Parsing: "${text}" (${language})`);

      const startTime = Date.now();

      const response = await getClient().chat.completions.create({
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          {
            role: "user",
            content: `Command: "${text}"\nLanguage: ${language}\n\nReturn ONLY the JSON object for this specific command. Use the exact product name the user said.`,
          },
        ],
        temperature: 0,
        max_tokens: 150,
        reasoning_effort: "none",
      });

      const endTime = Date.now();
      console.log(`⏱️ LLM response time: ${endTime - startTime}ms`);

      const content = response.choices[0].message.content || '{}';
      console.log(`📤 LLM Response: ${content}`);

      // Clean the response
      let cleanContent = content
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      // Try to extract JSON
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }

      console.log(`📤 Cleaned Response: ${cleanContent}`);

      let parsed;
      try {
        parsed = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', cleanContent);
        return this.fallbackParse(text);
      }

      // Forgiving parser - handle incomplete JSON
      if (!parsed.intent && parsed.product) {
        parsed.intent = 'ADD_ITEM';
        parsed.entities = { product: parsed.product };
      }

      if (!parsed.intent && parsed.entities?.product) {
        parsed.intent = 'ADD_ITEM';
      }

      if (!parsed.intent) {
        parsed.intent = 'ADD_ITEM';
        parsed.entities = { product: text };
      }

      const validIntents = ['ADD_ITEM', 'REMOVE_ITEM', 'REMOVE_MULTIPLE', 'UPDATE_QUANTITY', 'MARK_BOUGHT', 'SEARCH_PRODUCT', 'SHOW_LIST', 'GET_SUBSTITUTE', 'CLEAR_LIST', 'UNKNOWN'];
      if (!validIntents.includes(parsed.intent)) {
        console.warn(`⚠️ Invalid intent: ${parsed.intent}, defaulting to ADD_ITEM`);
        parsed.intent = 'ADD_ITEM';
      }
      
      return {
        intent: parsed.intent || 'ADD_ITEM',
        entities: parsed.entities || { product: text },
        confidence: parsed.confidence || 0.8,
        rawText: text,
      };
    } catch (error) {
      console.error('❌ LLM parse error:', error);
      return this.fallbackParse(text);
    }
  }

  // System prompt for LLM
  private getSystemPrompt(): string {
  return `You are a shopping assistant intent parser.

Your job is to understand natural language shopping commands and return ONLY valid JSON.

INTENTS:
- ADD_ITEM
- REMOVE_ITEM
- UPDATE_QUANTITY
- MARK_BOUGHT
- SEARCH_PRODUCT
- SHOW_LIST
- GET_SUBSTITUTE
- CLEAR_LIST
- UNKNOWN

IMPORTANT RULES:

1. ADD_ITEM means the user wants one or more products added to the shopping list.

2. REMOVE_ITEM means the user wants one or more products removed.

3. MARK_BOUGHT means the user wants one or more products marked as bought.

4. If the user mentions MULTIPLE products, return ALL products in the "items" array.

5. Split products using:
   - "and"
   - "&"
   - commas
   - natural language

6. If products have individual quantities, preserve the quantity for each product.

7. Examples:

"add milk" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"}]}}

"add 2 liters milk" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"milk","quantity":2,"unit":"L"}]}}

"I need apples" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"apples","quantity":1,"unit":"pc"}]}}

"milk and bread" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"},{"product":"bread","quantity":1,"unit":"pc"}]}}

"eggs, butter" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"eggs","quantity":1,"unit":"pc"},{"product":"butter","quantity":1,"unit":"pc"}]}}

"milk & bread" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"},{"product":"bread","quantity":1,"unit":"pc"}]}}

"add 2 apples and 3 bananas" → {"intent":"ADD_ITEM","entities":{"items":[{"product":"apples","quantity":2,"unit":"pc"},{"product":"bananas","quantity":3,"unit":"pc"}]}}

"remove milk and bread" → {"intent":"REMOVE_ITEM","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"},{"product":"bread","quantity":1,"unit":"pc"}]}}

"mark milk and eggs as bought" → {"intent":"MARK_BOUGHT","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"},{"product":"eggs","quantity":1,"unit":"pc"}]}}

"I don't need milk anymore" → {"intent":"REMOVE_ITEM","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"}]}}

"take milk off my list" → {"intent":"REMOVE_ITEM","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"}]}}

"bought eggs" → {"intent":"MARK_BOUGHT","entities":{"items":[{"product":"eggs","quantity":1,"unit":"pc"}]}}

"I got the milk" → {"intent":"MARK_BOUGHT","entities":{"items":[{"product":"milk","quantity":1,"unit":"pc"}]}}

For numbers written as words:
"two apples" → quantity 2
"three bananas" → quantity 3

Never invent products.
Never use products from the examples unless they are actually present in the user's command.

Return ONLY JSON.`;
}
  // Split multiple items
  private parseMultipleItems(text: string): ParsedItem[] {
  let cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/, '');

  // Remove common command prefixes
  cleaned = cleaned.replace(
    /^(add|please add|i need|i want|i want to buy|i need to buy|buy|put|put on my list)\s+/i,
    ''
  );

  // Remove common suffixes
  cleaned = cleaned.replace(
    /\s+(to my list|to the list|on my list|in my list)$/i,
    ''
  );

  // Normalize separators
  cleaned = cleaned
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s*,\s*/g, ' and ');

  const parts = cleaned
    .split(/\s+and\s+/i)
    .map(part => part.trim())
    .filter(Boolean);

  const items: ParsedItem[] = [];

  for (const part of parts) {
    let remaining = part.trim();
    let quantity = 1;
    let unit = 'pc';

    // Number + unit + product: "2 liters milk"
    const quantityMatch = remaining.match(
      /^(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|g|gram|grams|l|liter|liters|litre|litres|ml|milliliter|milliliters|dozen|piece|pieces|pc|pcs)?\s+(.+)$/i
    );

    if (quantityMatch) {
      quantity = Number(quantityMatch[1]);
      const rawUnit = quantityMatch[2]?.toLowerCase();

      if (rawUnit) {
        if (['kg', 'kgs', 'kilogram', 'kilograms'].includes(rawUnit)) unit = 'kg';
        else if (['g', 'gram', 'grams'].includes(rawUnit)) unit = 'g';
        else if (['l', 'liter', 'liters', 'litre', 'litres'].includes(rawUnit)) unit = 'L';
        else if (['ml', 'milliliter', 'milliliters'].includes(rawUnit)) unit = 'ml';
        else if (rawUnit === 'dozen') unit = 'dozen';
        else unit = 'pc';
      }

      remaining = quantityMatch[3].trim();
    }

    // Quantity AFTER product: "apples 2"
    const quantityAfterMatch = remaining.match(
      /^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g|l|liter|liters|ml|dozen|piece|pieces|pc|pcs)?$/i
    );

    if (quantityAfterMatch) {
      remaining = quantityAfterMatch[1].trim();
      quantity = Number(quantityAfterMatch[2]);
      const rawUnit = quantityAfterMatch[3]?.toLowerCase();

      if (rawUnit) {
        if (['kg'].includes(rawUnit)) unit = 'kg';
        else if (['g'].includes(rawUnit)) unit = 'g';
        else if (['l', 'liter', 'liters'].includes(rawUnit)) unit = 'L';
        else if (['ml'].includes(rawUnit)) unit = 'ml';
        else if (rawUnit === 'dozen') unit = 'dozen';
        else unit = 'pc';
      }
    }

    if (remaining) {
      items.push({
        product: remaining,
        quantity,
        unit,
      });
    }
  }

  return items;
}
  // Fallback regex parser
  private fallbackParse(text: string): ParsedIntent {
    const lower = text.toLowerCase().trim();
    
    // ✅ Check for multiple removal: "remove banana and egg"
    if (lower.includes('remove') || lower.includes('delete')) {
      const parts = text.split(/\s+and\s+|,\s*/);
      
      if (parts.length > 1) {
        const removeMatch = parts[0].match(/(?:remove|delete)\s*(.+)/);
        if (removeMatch) {
          const products = [removeMatch[1].trim()];
          for (let i = 1; i < parts.length; i++) {
            if (parts[i].trim()) {
              products.push(parts[i].trim());
            }
          }
          return {
            intent: 'REMOVE_MULTIPLE',
            entities: { products },
            confidence: 0.7,
            rawText: text,
          };
        }
      }
    }
    
    // Remove common prefixes
    let cleanText = text;
    const prefixes = ['add ', 'i need ', 'i want ', 'please add ', 'can you add '];
    for (const prefix of prefixes) {
      if (lower.startsWith(prefix)) {
        cleanText = text.substring(prefix.length).trim();
        break;
      }
    }
    
    const suffixes = [' to my list', ' to the list', ' in my list', ' in my cart'];
    for (const suffix of suffixes) {
      if (cleanText.toLowerCase().endsWith(suffix)) {
        cleanText = cleanText.substring(0, cleanText.length - suffix.length).trim();
        break;
      }
    }
    
    // If it's a simple product name, treat as ADD_ITEM
    if (cleanText && !lower.includes('remove') && !lower.includes('delete') && 
        !lower.includes('clear') && !lower.includes('show') && !lower.includes('list')) {
      return {
        intent: 'ADD_ITEM',
        entities: { product: cleanText },
        confidence: 0.7,
        rawText: text,
      };
    }
    
    // Check for clear list
    if (lower.includes('clear') || lower.includes('start over') || lower.includes('remove all')) {
      return { intent: 'CLEAR_LIST', entities: {} };
    }
    
    // Check for show list
    if (lower.includes('what') || lower.includes('show') || lower.includes('list')) {
      if (lower.includes('list') || lower.includes('have')) {
        return { intent: 'SHOW_LIST', entities: {} };
      }
    }
    
    // Check for remove single item
    if (lower.includes('remove') || lower.includes('delete') || lower.includes('hatao') || 
        lower.includes('nikal') || lower.includes('take off')) {
      const match = lower.match(/(?:remove|delete|hatao|nikal|take off)\s*(.+)/);
      return {
        intent: 'REMOVE_ITEM',
        entities: { product: match?.[1]?.trim() || 'unknown' },
        confidence: 0.6,
      };
    }
    
    // Check for mark bought
    if (lower.includes('bought') || lower.includes('got') || lower.includes('purchased') || 
        lower.includes('tick') || lower.includes('done')) {
      const match = lower.match(/(?:bought|got|purchased|tick|done)\s*(.+)/);
      return {
        intent: 'MARK_BOUGHT',
        entities: { product: match?.[1]?.trim() || 'unknown' },
        confidence: 0.6,
      };
    }
    
    // Check for update quantity
    const quantityMatch = lower.match(/(\d+)\s*(liter|kg|g|ml|dozen|piece|pcs|L)?/);
    if (quantityMatch) {
      const productMatch = lower.match(/(?:make|change|update)\s*.+\s*(\w+)/);
      return {
        intent: 'UPDATE_QUANTITY',
        entities: {
          product: productMatch?.[1] || 'unknown',
          quantity: parseInt(quantityMatch[1]),
          unit: quantityMatch[2] || undefined,
        },
        confidence: 0.5,
      };
    }
    
    // Default to ADD_ITEM with cleanText
    return {
      intent: 'ADD_ITEM',
      entities: { product: cleanText || text },
      confidence: 0.5,
    };
  }

  // Execute a parsed intent
  async executeIntent(parsed: ParsedIntent): Promise<ExecutionResult> {
    const { intent, entities } = parsed;
    
    try {
      switch (intent) {
        case 'ADD_ITEM': {
  let parsedItems: ParsedItem[] = [];

  // New multi-item format from LLM
  if (entities.items && entities.items.length > 0) {
    parsedItems = entities.items;
  }
  // Backward compatibility with old parser
  else if (entities.product) {
    parsedItems = this.parseMultipleItems(
      `${entities.quantity ? entities.quantity + ' ' : ''}${
        entities.unit ? entities.unit + ' ' : ''
      }${entities.product}`
    );
  }

  if (parsedItems.length === 0) {
    return {
      success: false,
      message: 'No product specified',
    };
  }

  const addedItems: string[] = [];

  for (const parsedItem of parsedItems) {
    const productName = parsedItem.product;
    const quantity = parsedItem.quantity || 1;
    const unit = parsedItem.unit || 'pc';

    let products = catalogService.searchProducts(productName);
    let product = products.length > 0 ? products[0] : null;

    if (!product) {
      const allProducts = catalogService.getAllProducts();
      const partialMatch = allProducts.find(p =>
        p.name.toLowerCase().includes(productName.toLowerCase()) ||
        productName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (partialMatch) {
        product = partialMatch;
        console.log(`📦 Partial match: "${productName}" → "${product.name}"`);
      }
    }

    if (!product) {
      product = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: productName,
        brand: 'Fresh',
        category: 'Other',
        size: '1',
        unit,
        price: 0,
        tags: [],
        season: 'all',
        substitutes: [],
      };
      console.log(`📦 Created custom product: "${productName}"`);
    }

    listService.addItem(product.id, quantity, unit);
    addedItems.push(quantity > 1 ? `${product.name} x${quantity}` : product.name);
  }

  return {
    success: true,
    message: `Added ${addedItems.join(', ')}`,
    data: { items: addedItems },
  };
}
        
        case 'REMOVE_ITEM': {
  let items: ParsedItem[] = [];

  if (entities.items?.length) {
    items = entities.items;
  } else if (entities.product) {
    items = this.parseMultipleItems(entities.product);
  }

  if (items.length === 0) {
    return {
      success: false,
      message: 'No product specified',
    };
  }

  const removedItems: string[] = [];

  for (const item of items) {
    const removed = listService.removeItemByName(item.product);
    if (removed) {
      removedItems.push(item.product);
    }
  }

  if (removedItems.length === 0) {
    return {
      success: false,
      message: 'Could not find the requested items in the list',
    };
  }

  return {
    success: true,
    message: `Removed ${removedItems.join(', ')} from list`,
    data: { items: removedItems },
  };
}
        case 'REMOVE_MULTIPLE': {
          const products = entities.products || [];
          if (!products.length) {
            return { success: false, message: 'No products specified' };
          }
          
          const removedItems: string[] = [];
          const notFound: string[] = [];
          
          for (const productName of products) {
            const removed = listService.removeItemByName(productName);
            if (removed) {
              removedItems.push(productName);
            } else {
              notFound.push(productName);
            }
          }
          
          if (removedItems.length === 0) {
            return {
              success: false,
              message: `Could not find: ${notFound.join(', ')}`,
            };
          }
          
          let message = `Removed: ${removedItems.join(', ')}`;
          if (notFound.length > 0) {
            message += `. Not found: ${notFound.join(', ')}`;
          }
          
          return {
            success: true,
            message,
          };
        }
        
        case 'UPDATE_QUANTITY': {
          const productName = entities.product;
          const quantity = entities.quantity;
          if (!productName || !quantity) {
            return { success: false, message: 'Product and quantity required' };
          }
          
          const list = listService.getList();
          const item = list.items.find(
            i => i.productName.toLowerCase() === productName.toLowerCase() && !i.isBought
          );
          
          if (item) {
            // ✅ If quantity is 0 or less, remove the item
            if (quantity <= 0) {
              listService.removeItem(item.id);
              return {
                success: true,
                message: `Removed ${item.productName} from list`,
              };
            }
            
            listService.updateQuantity(item.id, quantity);
            return {
              success: true,
              message: `Updated ${item.productName} to ${quantity} ${item.unit}`,
              data: { item },
            };
          } else {
            return {
              success: false,
              message: `Could not find "${productName}" in list`,
            };
          }
        }
        
        case 'MARK_BOUGHT': {
  let items: ParsedItem[] = [];

  if (entities.items?.length) {
    items = entities.items;
  } else if (entities.product) {
    items = this.parseMultipleItems(entities.product);
  }

  if (items.length === 0) {
    return {
      success: false,
      message: 'No product specified',
    };
  }

  const list = listService.getList();
  const boughtItems: string[] = [];

  for (const requested of items) {
    const item = list.items.find(
      i =>
        i.productName.toLowerCase() === requested.product.toLowerCase() &&
        !i.isBought
    );

    if (item) {
      listService.markBought(item.id, true);
      boughtItems.push(item.productName);
    }
  }

  if (boughtItems.length === 0) {
    return {
      success: false,
      message: 'Could not find the requested items in the active list',
    };
  }

  return {
    success: true,
    message: `Marked ${boughtItems.join(', ')} as bought ✅`,
    data: { items: boughtItems },
  };
}
        
        case 'SHOW_LIST': {
          const list = listService.getList();
          const total = listService.getTotalCost();
          const items = list.items.filter(i => !i.isBought);
          
          if (items.length === 0) {
            return {
              success: true,
              message: 'Your shopping list is empty',
              data: { items: [], total: 0 },
            };
          }
          
          const itemNames = items.map(i => `${i.productName} x${i.quantity}`).join(', ');
          return {
            success: true,
            message: `You have: ${itemNames}. Total: ₹${total}`,
            data: { items, total },
          };
        }
        
        case 'CLEAR_LIST': {
          listService.clearList();
          return {
            success: true,
            message: 'Cleared all items from list',
          };
        }
        
        case 'GET_SUBSTITUTE': {
          const productName = entities.product;
          if (!productName) {
            return { success: false, message: 'No product specified' };
          }
          
          const products = catalogService.searchProducts(productName);
          if (products.length === 0) {
            return {
              success: false,
              message: `Could not find "${productName}" in catalog`,
            };
          }
          
          const product = products[0];
          const substitutes = catalogService.getSubstitutes(product.id);
          
          if (substitutes.length === 0) {
            return {
              success: true,
              message: `No substitutes found for ${productName}`,
              data: { substitutes: [] },
            };
          }
          
          const substituteNames = substitutes.map(p => `${p.brand} ${p.name}`).join(', ');
          return {
            success: true,
            message: `Try: ${substituteNames}`,
            data: { substitutes },
          };
        }
        
        case 'SEARCH_PRODUCT': {
          const query = entities.product || '';
          const results = catalogService.searchProducts(query);
          
          if (results.length === 0) {
            return {
              success: true,
              message: `No products found matching "${query}"`,
              data: { results: [] },
            };
          }
          
          const resultNames = results.slice(0, 5).map(p => `${p.brand} ${p.name} (₹${p.price})`).join(', ');
          return {
            success: true,
            message: `Found: ${resultNames}`,
            data: { results: results.slice(0, 10) },
          };
        }
        
        default: {
          return {
            success: false,
            message: `Unknown command. Try "add milk" or "remove bread"`,
          };
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Error: ${error.message || 'Unknown error'}`,
        error: error.message,
      };
    }
  }
}

// Export singleton
export const intentParser = new IntentParser();