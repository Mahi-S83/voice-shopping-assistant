// ⚠️ CRITICAL: Load .env FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Check if API key is loaded
console.log('🔍 Environment check:');
console.log('  GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Present' : '❌ Missing');
console.log('  PORT:', process.env.PORT);
console.log('');

// NOW import everything else
import { catalogService } from '../src/services/catalogService';
import { intentParser } from '../src/services/intentParser';
import { listService } from '../src/services/listService';

// Load catalog
catalogService.loadCatalog();

console.log('🧠 Testing Intent Parser\n');
console.log('='.repeat(50));

async function testCommand(text: string) {
  console.log(`\n📝 Command: "${text}"`);
  
  try {
    // Parse the intent
    const parsed = await intentParser.parseText(text);
    console.log(`  Intent: ${parsed.intent}`);
    console.log(`  Entities:`, parsed.entities);
    
    // Execute the intent
    const result = await intentParser.executeIntent(parsed);
    console.log(`  Result: ${result.message}`);
    if (result.data) {
      console.log(`  Data:`, result.data);
    }
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

async function runTests() {
  // Clear list first
  listService.clearList();
  
  // Test 1: Add item
  await testCommand('add 2 liters of milk');
  
  // Test 2: Add another item
  await testCommand('I need bread');
  
  // Test 3: Add with brand
  await testCommand('add Amul butter');
  
  // Test 4: Show list
  await testCommand('what is on my list');
  
  // Test 5: Mark as bought
  await testCommand('mark milk as bought');
  
  // Test 6: Show list again
  await testCommand('whats my list');
  
  // Test 7: Remove item
  await testCommand('remove bread');
  
  // Test 8: Search
  await testCommand('search for organic honey');
  
  // Test 9: Substitute
  await testCommand('what can I use instead of butter');
  
  // Test 10: Hindi command
  await testCommand('doodh add karo');
  
  // Test 11: Clear list
  await testCommand('clear list');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests complete!');
}

// Run tests
runTests().catch(console.error);