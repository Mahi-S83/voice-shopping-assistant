const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function parseVoiceCommand(text, language = 'en') {
  const response = await fetch(`${API_BASE}/api/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language })
  });
  return response.json();
}

export async function getShoppingList() {
  const response = await fetch(`${API_BASE}/api/list`);
  return response.json();
}

export async function addItemToList(productName, quantity = 1, unit = '') {
  const response = await fetch(`${API_BASE}/api/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, quantity, unit })
  });
  return response.json();
}

export async function removeItemFromList(itemId) {
  const response = await fetch(`${API_BASE}/api/list/${itemId}`, {
    method: 'DELETE'
  });
  return response.json();
}

export async function searchProducts(query) {
  const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function searchProductsWithFilters(query, filters = {}) {
  const params = new URLSearchParams({ q: query });
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.minPrice !== undefined && filters.minPrice !== null) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice);
  if (filters.size) params.append('size', filters.size);
  if (filters.organic) params.append('organic', 'true');
  
  const response = await fetch(`${API_BASE}/api/search?${params.toString()}`);
  return response.json();
}