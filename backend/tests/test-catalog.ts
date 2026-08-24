import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { catalogService } from '../src/services/catalogService';

// Load catalog
catalogService.loadCatalog();

console.log('📋 Testing Catalog Service\n');
console.log(`Total products: ${catalogService.getProductCount()}`);

// Test search
console.log('\n🔍 Search for "milk":');
const milkResults = catalogService.searchProducts('milk');
milkResults.forEach(p => {
  console.log(`  - ${p.brand} ${p.name} (₹${p.price}/${p.size}${p.unit})`);
});

// Test category
console.log('\n📂 Dairy products:');
const dairyProducts = catalogService.getProductsByCategory('Dairy');
dairyProducts.forEach(p => {
  console.log(`  - ${p.brand} ${p.name}`);
});

// Test substitutes
console.log('\n🔄 Substitutes for Amul Milk:');
const substitutes = catalogService.getSubstitutes('prod_001');
substitutes.forEach(p => {
  console.log(`  - ${p.brand} ${p.name} (₹${p.price})`);
});

// Test seasonal
console.log('\n🌞 Summer seasonal products:');
const seasonal = catalogService.getSeasonalProducts('summer');
seasonal.forEach(p => {
  console.log(`  - ${p.name} (${p.brand})`);
});