import * as fs from 'fs';
import * as path from 'path';
import Fuse from 'fuse.js';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  unit: string;
  price: number;
  tags: string[];
  season: 'summer' | 'winter' | 'monsoon' | 'all' | string;
  substitutes: string[];
}

class CatalogService {
  private products: Product[] = [];
  private fuse: Fuse<Product> | null = null;

  // Load catalog from JSON file
  loadCatalog(): void {
    try {
      const dataPath = path.resolve(__dirname, '../../data/catalog.json');
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      const jsonData = JSON.parse(rawData);
      this.products = jsonData.products || [];
      
      // Initialize Fuse.js for fuzzy search
      this.fuse = new Fuse(this.products, {
        keys: ['name', 'brand', 'category', 'tags'],
        threshold: 0.4,
        includeScore: true,
      });
      
      console.log(`✅ Catalog loaded: ${this.products.length} products`);
    } catch (error) {
      console.error('❌ Failed to load catalog:', error);
      this.products = [];
    }
  }

  // Get all products
  getAllProducts(): Product[] {
    return this.products;
  }

  // Find product by ID
  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  // Search products using Fuse.js
  searchProducts(query: string): Product[] {
  if (!query || !query.trim()) {
    return this.products;
  }
  
  const q = query.toLowerCase().trim().replace(/s$/, ''); // crude singularize
  
  // First try: exact match
  let results = this.products.filter(p =>
    p.name.toLowerCase().includes(q) || 
    q.includes(p.name.toLowerCase())
  );
  
  // Second try: fuzzy match using Fuse.js
  if (results.length === 0 && this.fuse) {
    const fuseResults = this.fuse.search(query);
    results = fuseResults.map(result => result.item);
  }
  
  return results.slice(0, 10);
}

  // Filter products by category
  getProductsByCategory(category: string): Product[] {
    return this.products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get substitutes for a product
  getSubstitutes(productId: string): Product[] {
    const product = this.getProductById(productId);
    if (!product) return [];
    
    return product.substitutes
      .map(id => this.getProductById(id))
      .filter((p): p is Product => p !== undefined);
  }

  // Get seasonal products
  getSeasonalProducts(season: string): Product[] {
    return this.products.filter(p => 
      p.season === season || p.season === 'all'
    );
  }

  // Get products by price range
  getProductsByPriceRange(min: number, max: number): Product[] {
    return this.products.filter(p => 
      p.price >= min && p.price <= max
    );
  }

  // Get product count
  getProductCount(): number {
    return this.products.length;
  }
}

// Export singleton instance
export const catalogService = new CatalogService();