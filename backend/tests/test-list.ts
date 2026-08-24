import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { catalogService } from '../src/services/catalogService';
import { listService } from '../src/services/listService';

// Load catalog first
catalogService.loadCatalog();

console.log('📋 Testing Shopping List Service\n');

// Add items
console.log('🛒 Adding items to list...');
const milk = catalogService.searchProducts('milk')[0];
const bread = catalogService.searchProducts('bread')[0];
const eggs = catalogService.searchProducts('eggs')[0];

if (milk) {
  const item = listService.addItem(milk.id, 2);
  console.log(`  ✅ Added: ${item.productName} x${item.quantity} ${item.unit}`);
}

if (bread) {
  const item = listService.addItem(bread.id, 1);
  console.log(`  ✅ Added: ${item.productName} x${item.quantity} ${item.unit}`);
}

if (eggs) {
  const item = listService.addItem(eggs.id, 1, 'dozen');
  console.log(`  ✅ Added: ${item.productName} x${item.quantity} ${item.unit}`);
}

// View list
console.log('\n📋 Current Shopping List:');
const list = listService.getList();
list.items.forEach(item => {
  const bought = item.isBought ? '✅' : '⬜';
  console.log(`  ${bought} ${item.productName} x${item.quantity} ${item.unit} (${item.brand})`);
});

console.log(`\n💰 Total Cost: ₹${listService.getTotalCost()}`);
console.log(`📦 Total Items: ${listService.getTotalItems()}`);
console.log(`🎯 Active Items: ${listService.getActiveItemCount()}`);

// Test mark as bought
console.log('\n✅ Marking milk as bought...');
const milkItem = list.items.find(item => item.productName === 'Milk');
if (milkItem) {
  listService.markBought(milkItem.id, true);
  console.log(`  ✅ ${milkItem.productName} marked as bought!`);
}

// Test remove
console.log('\n🗑️ Removing eggs...');
const eggItem = list.items.find(item => item.productName === 'Eggs');
if (eggItem) {
  listService.removeItem(eggItem.id);
  console.log(`  ✅ ${eggItem.productName} removed!`);
}

// Final list
console.log('\n📋 Final Shopping List:');
const finalList = listService.getList();
finalList.items.forEach(item => {
  const bought = item.isBought ? '✅' : '⬜';
  console.log(`  ${bought} ${item.productName} x${item.quantity} ${item.unit}`);
});

console.log(`\n💰 Total Cost: ₹${listService.getTotalCost()}`);
console.log(`📦 Total Items: ${listService.getTotalItems()}`);
console.log(`🎯 Active Items: ${listService.getActiveItemCount()}`);