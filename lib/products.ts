import sql from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Product { id: string; name: string; description: string; price: number; stock: number; category_id: string | null; image: string | null; images: string | null; sku: string | null; active: number; featured: number; bestseller: number; created_at: string; updated_at: string; category_name?: string; averageRating?: number; reviewCount?: number; }
export interface Category { id: string; name: string; slug: string; description: string | null; image: string | null; active: number; created_at?: string; }
export interface CartItem { id: string; name: string; price: number; quantity: number; image: string | null; }
export interface Order { id: string; customer_name: string; customer_phone: string; customer_email: string | null; customer_address: string; customer_notes: string | null; delivery_method: string; total: number; status: string; items: string; user_id: string | null; created_at: string; updated_at: string; }

export function normalizeProduct(p: any): Product {
  if (!p) return p;
  return {
    id: p.id,
    name: p.name || p.nombre || '',
    description: p.description || p.descripcion || '',
    price: Number(p.price || p.precio || 0),
    stock: Number(p.stock || 0),
    category_id: p.category_id || p.categoria_id || null,
    image: p.image || p.imagen || null,
    images: p.images || p.imagenes || null,
    sku: p.sku || null,
    active: Number(p.active === undefined ? (p.activo === undefined ? 1 : p.activo) : p.active),
    featured: Number(p.featured || p.destacado || 0),
    bestseller: Number(p.bestseller || p.mas_vendido || 0),
    created_at: p.created_at || p.fecha_creacion || '',
    updated_at: p.updated_at || p.fecha_actualizacion || '',
    category_name: p.category_name || p.nombre_categoria || undefined,
    averageRating: Number(p.averagerating || p.averageRating || p.avgRating || p.calificacion_promedio || 0),
    reviewCount: Number(p.reviewcount || p.reviewCount || p.total_reviews || 0),
  };
}

export async function getAllProducts(activeOnly = true): Promise<Product[]> {
  if (activeOnly) {
    const results = await sql`
      SELECT p.*, c.name as category_name, COALESCE(r.avgRating, 0) as averageRating, COALESCE(r.reviewCount, 0) as reviewCount
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (SELECT product_id, AVG(rating) as avgRating, CAST(COUNT(*) as INTEGER) as reviewCount FROM reviews WHERE approved = 1 GROUP BY product_id) r ON p.id = r.product_id
      WHERE p.active = 1 ORDER BY p.created_at DESC
    `;
    return results.map(normalizeProduct);
  }
  const results = await sql`
      SELECT p.*, c.name as category_name, COALESCE(r.avgRating, 0) as averageRating, COALESCE(r.reviewCount, 0) as reviewCount
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (SELECT product_id, AVG(rating) as avgRating, CAST(COUNT(*) as INTEGER) as reviewCount FROM reviews WHERE approved = 1 GROUP BY product_id) r ON p.id = r.product_id
      ORDER BY p.created_at DESC
  `;
  return results.map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await sql`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ${id}`;
  if (!result[0]) return null;
  return normalizeProduct(result[0]);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const results = await sql`
    SELECT p.*, c.name as category_name, COALESCE(r.avgRating, 0) as averageRating, COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (SELECT product_id, AVG(rating) as avgRating, CAST(COUNT(*) as INTEGER) as reviewCount FROM reviews WHERE approved = 1 GROUP BY product_id) r ON p.id = r.product_id
    WHERE p.active = 1 AND p.featured = 1 ORDER BY p.created_at DESC LIMIT ${limit}
  `;
  return results.map(normalizeProduct);
}

export async function getBestsellerProducts(limit = 8): Promise<Product[]> {
  const results = await sql`
    SELECT p.*, c.name as category_name, COALESCE(r.avgRating, 0) as averageRating, COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (SELECT product_id, AVG(rating) as avgRating, CAST(COUNT(*) as INTEGER) as reviewCount FROM reviews WHERE approved = 1 GROUP BY product_id) r ON p.id = r.product_id
    WHERE p.active = 1 AND p.bestseller = 1 ORDER BY p.created_at DESC LIMIT ${limit}
  `;
  return results.map(normalizeProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const term = `%${query}%`;
  const results = await sql`
    SELECT p.*, c.name as category_name, COALESCE(r.avgRating, 0) as averageRating, COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (SELECT product_id, AVG(rating) as avgRating, CAST(COUNT(*) as INTEGER) as reviewCount FROM reviews WHERE approved = 1 GROUP BY product_id) r ON p.id = r.product_id
    WHERE p.active = 1 AND (p.name ILIKE ${term} OR p.description ILIKE ${term} OR c.name ILIKE ${term}) ORDER BY p.created_at DESC
  `;
  return results.map(normalizeProduct);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const results = await sql`
    SELECT p.*, c.name as category_name, COALESCE(r.avgRating, 0) as averageRating, COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (SELECT product_id, AVG(rating) as avgRating, CAST(COUNT(*) as INTEGER) as reviewCount FROM reviews WHERE approved = 1 GROUP BY product_id) r ON p.id = r.product_id
    WHERE p.category_id = ${categoryId} AND p.active = 1 ORDER BY p.created_at DESC
  `;
  return results.map(normalizeProduct);
}

export async function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const id = uuidv4();
  await sql`
    INSERT INTO products (id, name, description, price, stock, category_id, image, images, sku, active, featured, bestseller)
    VALUES (${id}, ${data.name}, ${data.description}, ${data.price}, ${data.stock}, ${data.category_id}, ${data.image}, ${data.images}, ${data.sku}, ${data.active}, ${data.featured}, ${data.bestseller})
  `;
  return id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<boolean> {
  try {
    const keys = Object.keys(data).filter(k => (data as any)[k] !== undefined && typeof (data as any)[k] !== 'function');
    if (keys.length === 0) return false;
    await sql`UPDATE products SET ${sql(data as any, keys)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    return true;
  } catch (err) { return false; }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try { await sql`DELETE FROM products WHERE id = ${id}`; return true; } catch (err) { return false; }
}

export async function getAllCategories(activeOnly = true): Promise<Category[]> {
  if (activeOnly) return (await sql`SELECT * FROM categories WHERE active = 1 ORDER BY name`) as Category[];
  return (await sql`SELECT * FROM categories ORDER BY name`) as Category[];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await sql`SELECT * FROM categories WHERE id = ${id}`;
  return (result[0] as Category) || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await sql`SELECT * FROM categories WHERE slug = ${slug}`;
  return (result[0] as Category) || null;
}

export async function createCategory(data: { name: string; slug: string; description?: string; image?: string }): Promise<string> {
  const id = uuidv4();
  await sql`INSERT INTO categories (id, name, slug, description, image) VALUES (${id}, ${data.name}, ${data.slug}, ${data.description || null}, ${data.image || null})`;
  return id;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<boolean> {
  try {
    const keys = Object.keys(data).filter(k => (data as any)[k] !== undefined);
    if (keys.length === 0) return false;
    await sql`UPDATE categories SET ${sql(data as any, keys)} WHERE id = ${id}`;
    return true;
  } catch (e) { return false; }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try { await sql`DELETE FROM categories WHERE id = ${id}`; return true; } catch (e) { return false; }
}

export async function createOrder(data: { 
  customer_name: string; 
  customer_phone: string; 
  customer_email?: string; 
  customer_address: string; 
  customer_notes?: string; 
  delivery_method?: string; 
  total: number; 
  items: CartItem[]; 
  user_id?: string | null;
  province?: string;
  city?: string;
  postal_code?: string;
  shipping_company?: string;
  shipping_cost?: number;
}): Promise<string> {
  const id = uuidv4();
  await sql`
    INSERT INTO orders (id, customer_name, customer_phone, customer_email, customer_address, customer_notes, delivery_method, total, items, user_id, province, city, postal_code, shipping_company, shipping_cost)
    VALUES (
      ${id}, 
      ${data.customer_name}, 
      ${data.customer_phone}, 
      ${data.customer_email || null}, 
      ${data.customer_address}, 
      ${data.customer_notes || null}, 
      ${data.delivery_method || 'delivery'}, 
      ${data.total}, 
      ${JSON.stringify(data.items)}, 
      ${data.user_id || null},
      ${data.province || null},
      ${data.city || null},
      ${data.postal_code || null},
      ${data.shipping_company || null},
      ${data.shipping_cost || 0}
    )
  `;
  if (data.user_id) {
    try {
      const pointsEarned = Math.floor(data.total / 100);
      if (pointsEarned > 0) await sql`UPDATE users SET points = points + ${pointsEarned} WHERE id = ${data.user_id}`;
    } catch (error) {}
  }
  return id;
}

export async function getAllOrders(): Promise<Order[]> { return (await sql`SELECT * FROM orders ORDER BY created_at DESC`) as Order[]; }
export async function getOrderById(id: string): Promise<Order | null> { const result = await sql`SELECT * FROM orders WHERE id = ${id}`; return (result[0] as Order) || null; }
export async function updateOrderStatus(id: string, status: string): Promise<boolean> { try { await sql`UPDATE orders SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`; return true; } catch (error) { return false; } }
export async function getRecentOrders(limit = 10): Promise<Order[]> { return (await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}`) as Order[]; }

export async function getStats() {
  const totalProducts = await sql`SELECT COUNT(*) as count FROM products WHERE active = 1`;
  const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;
  const totalRevenue = await sql`SELECT SUM(total) as revenue FROM orders`;
  const pendingOrders = await sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`;
  const totalUsers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`;
  const lowStockCount = await sql`SELECT COUNT(*) as count FROM products WHERE stock < 10 AND active = 1`;
  const pendingReviews = await sql`SELECT COUNT(*) as count FROM reviews WHERE approved = 0`;
  const newsletterCount = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE active = 1`;

  const revenue = Number(totalRevenue[0]?.revenue || 0);
  const count = Number(totalOrders[0]?.count || 0);
  const averageTicket = count > 0 ? (revenue / count).toFixed(2) : 0;

  return {
    totalProducts: Number(totalProducts[0]?.count || 0), totalOrders: count, totalRevenue: revenue,
    pendingOrders: Number(pendingOrders[0]?.count || 0), totalUsers: Number(totalUsers[0]?.count || 0),
    averageTicket: Number(averageTicket), lowStockCount: Number(lowStockCount[0]?.count || 0),
    pendingReviews: Number(pendingReviews[0]?.count || 0), newsletterCount: Number(newsletterCount[0]?.count || 0)
  };
}

export async function getLowStockProducts(limit = 5) {
  return (await sql`SELECT id, name, stock FROM products WHERE stock < 10 AND active = 1 ORDER BY stock ASC LIMIT ${limit}`) as { id: string, name: string, stock: number }[];
}
