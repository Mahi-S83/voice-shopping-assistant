import express from 'express';
import { catalogService } from '../services/catalogService';
import { listService } from '../services/listService';
import { intentParser } from '../services/intentParser';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Parse voice command
router.post('/parse', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const parsed = await intentParser.parseText(text, language);
    const result = await intentParser.executeIntent(parsed);
    
    res.json({
      parsed,
      result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get shopping list
router.get('/list', (req, res) => {
  const list = listService.getList();
  res.json(list);
});

// Add item to list
router.post('/list', async (req, res) => {
  try {
    const { productName, quantity, unit } = req.body;
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    const products = catalogService.searchProducts(productName);
    if (products.length === 0) {
      return res.status(404).json({ error: `Product "${productName}" not found` });
    }
    
    const product = products[0];
    const item = listService.addItem(product.id, quantity || 1, unit);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from list
router.delete('/list/:id', (req, res) => {
  const removed = listService.removeItem(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ success: true });
});

// Update item quantity
router.put('/list/:id', (req, res) => {
  const { quantity, isBought } = req.body;
  const item = listService.updateQuantity(req.params.id, quantity);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (isBought !== undefined) {
    listService.markBought(req.params.id, isBought);
  }
  res.json({ success: true, item });
});

// Clear list
router.delete('/list', (req, res) => {
  listService.clearList();
  res.json({ success: true });
});

// Search products
// Search products with filters
router.get('/search', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const brand = req.query.brand as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const size = req.query.size as string | undefined;
    const organic = req.query.organic === 'true';

    console.log('🔎 Search request:', { query, brand, minPrice, maxPrice, size, organic });

    // Start with all products
    let results = catalogService.getAllProducts();

    // Search by product name
    if (query) {
      results = catalogService.searchProducts(query);
      console.log('📦 After product search:', results.length);
    }

    // Brand filter
    if (brand) {
      results = results.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
      console.log('🏷️ After brand filter:', results.length);
    }

    // Min price filter
    if (minPrice !== undefined && !isNaN(minPrice)) {
      results = results.filter(p => p.price >= minPrice);
      console.log('💰 After min price:', results.length);
    }

    // Max price filter
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      results = results.filter(p => p.price <= maxPrice);
      console.log('💰 After max price:', results.length);
    }

    // Size filter
    if (size) {
      results = results.filter(p => p.size.toLowerCase().includes(size.toLowerCase()));
      console.log('📏 After size filter:', results.length);
    }

    // Organic filter
    if (organic) {
      results = results.filter(p => p.tags?.some(tag => tag.toLowerCase() === 'organic'));
      console.log('🌱 After organic filter:', results.length);
    }

    console.log('✅ Final results:', results.length);

    res.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Voice search with NLP
// Voice search with NLP
router.post('/search/voice', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    console.log('🎤 Voice search:', text);
    
    // Parse the search query using NLP
    const { searchParser } = await import('../services/searchParser.js');
    const parsed = await searchParser.parseSearchQuery(text);
    
    console.log('📋 Parsed entities:', JSON.stringify(parsed.entities, null, 2));
    
    const { query, brand, minPrice, maxPrice, size, organic } = parsed.entities;
    
    console.log('💰 Price filters - min:', minPrice, 'max:', maxPrice);
    
    // Start with all products
    let results = catalogService.getAllProducts();
    
    // Apply search
    if (query) {
      results = catalogService.searchProducts(query);
      console.log('📦 After query search:', results.length);
    }
    
    // Apply brand filter
    if (brand) {
      results = results.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
      console.log('🏷️ After brand filter:', results.length);
    }
    
    // ✅ Apply price filters
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      results = results.filter(p => p.price >= minPrice);
      console.log('💰 After minPrice filter (>=', minPrice, '):', results.length);
    }
    
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      results = results.filter(p => p.price <= maxPrice);
      console.log('💰 After maxPrice filter (<=', maxPrice, '):', results.length);
    }
    
    // Apply size filter
    if (size) {
      results = results.filter(p => 
        p.size.toLowerCase().includes(size.toLowerCase()) ||
        p.size.toLowerCase() === size.toLowerCase()
      );
      console.log('📏 After size filter:', results.length);
    }
    
    // Apply organic filter
    if (organic) {
      results = results.filter(p => p.tags.includes('organic'));
      console.log('🌱 After organic filter:', results.length);
    }
    
    console.log('📦 Final results:', results.length);
    
    res.json({
      success: true,
      parsed: parsed.entities,
      results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Voice search error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Get recommendations
router.get('/recommendations', (req, res) => {
  // Simple recommendations for now
  const list = listService.getList();
  const allProducts = catalogService.getAllProducts();
  
  // Get items not in list
  const listIds = list.items.map(i => i.productId);
  const recommendations = allProducts
    .filter(p => !listIds.includes(p.id))
    .slice(0, 5)
    .map(p => ({
      product: p,
      reason: 'You might also like this',
    }));
  
  res.json({ recommendations });
});

export default router;