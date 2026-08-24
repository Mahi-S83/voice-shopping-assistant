import { Product, catalogService } from './catalogService';

export interface ListItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  brand?: string;
  size?: string;
  category: string;
  price?: number; 
  addedAt: string; // ISO timestamp
  notes?: string;
  isBought: boolean;
}

export interface ShoppingList {
  items: ListItem[];
  lastUpdated: string;
  version: number;
}

export interface PurchaseHistory {
  itemId: string;
  timestamp: string;
  quantity: number;
}

class ListService {
  private items: ListItem[] = [];
  private history: PurchaseHistory[] = [];
  private version: number = 1;
  private nextId: number = 1;

  // Get the entire list
  getList(): ShoppingList {
    return {
      items: [...this.items],
      lastUpdated: new Date().toISOString(),
      version: this.version,
    };
  }

  // Get only active (not bought) items
  getActiveItems(): ListItem[] {
    return this.items.filter(item => !item.isBought);
  }

  // Get bought items
  getBoughtItems(): ListItem[] {
    return this.items.filter(item => item.isBought);
  }

  // Add a new item to the list
  addItem(
    productId: string,
    quantity: number = 1,
    unit?: string,
    notes?: string
  ): ListItem {
    const product = catalogService.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Check if item already exists (same product, not bought)
    const existingItem = this.items.find(
      item => item.productId === productId && !item.isBought
    );

    if (existingItem) {
      // Update quantity instead of adding duplicate
      existingItem.quantity += quantity;
      existingItem.addedAt = new Date().toISOString();
      this.version++;
      return existingItem;
    }

    // Create new item
    const newItem: ListItem = {
  id: `item_${String(this.nextId++).padStart(3, '0')}`,
  productId: product.id,
  productName: product.name,
  quantity: quantity,
  unit: unit || product.unit,
  brand: product.brand,
  size: product.size,
  category: product.category || 'Other',  // ✅ Always set a category
  price: product.price || 0,
  addedAt: new Date().toISOString(),
  notes: notes,
  isBought: false,
};

    this.items.push(newItem);
    this.version++;
    
    // Record in history for recommendations
    this.recordPurchase(productId, quantity);
    
    return newItem;
  }

  // Add item by product name (for voice commands)
  addItemByName(
    productName: string,
    quantity: number = 1,
    unit?: string
  ): ListItem | null {
    // Search for product
    const products = catalogService.searchProducts(productName);
    if (products.length === 0) {
      return null;
    }
    
    // Use the first match
    const product = products[0];
    return this.addItem(product.id, quantity, unit);
  }

  // Remove an item from the list
  removeItem(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.items.splice(index, 1);
    this.version++;
    return true;
  }

  // Remove item by product name
  removeItemByName(productName: string): boolean {
    const index = this.items.findIndex(
      item => item.productName.toLowerCase() === productName.toLowerCase() && !item.isBought
    );
    if (index === -1) return false;
    
    this.items.splice(index, 1);
    this.version++;
    return true;
  }

  // Update quantity of an item
  updateQuantity(id: string, newQuantity: number): ListItem | null {
    const item = this.items.find(i => i.id === id);
    if (!item) return null;
    
    if (newQuantity <= 0) {
      this.removeItem(id);
      return null;
    }
    
    item.quantity = newQuantity;
    item.addedAt = new Date().toISOString();
    this.version++;
    return item;
  }

  // Mark item as bought (or un-bought)
  markBought(id: string, isBought: boolean = true): ListItem | null {
    const item = this.items.find(i => i.id === id);
    if (!item) return null;
    
    item.isBought = isBought;
    this.version++;
    return item;
  }

  // Clear all items from the list
  clearList(): void {
    this.items = [];
    this.version++;
  }

  // Record purchase in history for recommendations
  private recordPurchase(productId: string, quantity: number): void {
    this.history.push({
      itemId: productId,
      timestamp: new Date().toISOString(),
      quantity: quantity,
    });
  }

  // Get purchase history
  getPurchaseHistory(): PurchaseHistory[] {
    return [...this.history];
  }

  // Get items by category
  getItemsByCategory(category: string): ListItem[] {
    return this.items.filter(
      item => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get total item count
  getTotalItems(): number {
    return this.items.length;
  }

  // Get active item count
  getActiveItemCount(): number {
    return this.items.filter(item => !item.isBought).length;
  }

  // Calculate total cost (using catalog prices)
  getTotalCost(): number {
    let total = 0;
    for (const item of this.items) {
      if (item.isBought) continue;
      const product = catalogService.getProductById(item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return Math.round(total * 100) / 100;
  }
}

// Export singleton instance
export const listService = new ListService();