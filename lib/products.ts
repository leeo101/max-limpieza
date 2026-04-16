import db from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string | null;
  image: string | null;
  images: string | null;
  sku: string | null;
  active: number;
  featured: number;
  bestseller: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_notes: string | null;
  delivery_method: string;
  total: number;
  status: string;
  items: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// Product functions
export function getAllProducts(activeOnly = true): Product[] {
  const query = activeOnly
    ? `SELECT p.*, c.name as category_name, 
        COALESCE(r.avgRating, 0) as averageRating, 
        COALESCE(r.reviewCount, 0) as reviewCount
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT product_id, AVG(rating) as avgRating, COUNT(*) as reviewCount 
        FROM reviews 
        WHERE approved = 1 
        GROUP BY product_id
      ) r ON p.id = r.product_id
      WHERE p.active = 1 
      ORDER BY p.created_at DESC`
    : `SELECT p.*, c.name as category_name,
        COALESCE(r.avgRating, 0) as averageRating,
        COALESCE(r.reviewCount, 0) as reviewCount
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT product_id, AVG(rating) as avgRating, COUNT(*) as reviewCount 
        FROM reviews 
        WHERE approved = 1 
        GROUP BY product_id
      ) r ON p.id = r.product_id
      ORDER BY p.created_at DESC`;
  return db.prepare(query).all() as Product[];
}

export function getProductById(id: string): Product | null {
  const product = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id) as Product | null;
  return product || null;
}

export function getFeaturedProducts(limit = 8): Product[] {
  return db.prepare(`
    SELECT p.*, c.name as category_name,
      COALESCE(r.avgRating, 0) as averageRating,
      COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (
      SELECT product_id, AVG(rating) as avgRating, COUNT(*) as reviewCount 
      FROM reviews 
      WHERE approved = 1 
      GROUP BY product_id
    ) r ON p.id = r.product_id
    WHERE p.active = 1 AND p.featured = 1 
    ORDER BY p.created_at DESC 
    LIMIT ?
  `).all(limit) as Product[];
}

export function getBestsellerProducts(limit = 8): Product[] {
  return db.prepare(`
    SELECT p.*, c.name as category_name,
      COALESCE(r.avgRating, 0) as averageRating,
      COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (
      SELECT product_id, AVG(rating) as avgRating, COUNT(*) as reviewCount 
      FROM reviews 
      WHERE approved = 1 
      GROUP BY product_id
    ) r ON p.id = r.product_id
    WHERE p.active = 1 AND p.bestseller = 1 
    ORDER BY p.created_at DESC 
    LIMIT ?
  `).all(limit) as Product[];
}

export function searchProducts(query: string): Product[] {
  const searchQuery = `%${query}%`;
  return db.prepare(`
    SELECT p.*, c.name as category_name,
      COALESCE(r.avgRating, 0) as averageRating,
      COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (
      SELECT product_id, AVG(rating) as avgRating, COUNT(*) as reviewCount 
      FROM reviews 
      WHERE approved = 1 
      GROUP BY product_id
    ) r ON p.id = r.product_id
    WHERE p.active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
    ORDER BY p.created_at DESC
  `).all(searchQuery, searchQuery, searchQuery) as Product[];
}

export function getProductsByCategory(categoryId: string): Product[] {
  return db.prepare(`
    SELECT p.*, c.name as category_name,
      COALESCE(r.avgRating, 0) as averageRating,
      COALESCE(r.reviewCount, 0) as reviewCount
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN (
      SELECT product_id, AVG(rating) as avgRating, COUNT(*) as reviewCount 
      FROM reviews 
      WHERE approved = 1 
      GROUP BY product_id
    ) r ON p.id = r.product_id
    WHERE p.category_id = ? AND p.active = 1 
    ORDER BY p.created_at DESC
  `).all(categoryId) as Product[];
}

export function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO products (id, name, description, price, stock, category_id, image, images, sku, active, featured, bestseller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.name, data.description, data.price, data.stock, data.category_id, data.image, data.images, data.sku, data.active, data.featured, data.bestseller);
  return id;
}

export function updateProduct(id: string, data: Partial<Product>): boolean {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return false;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
}

export function deleteProduct(id: string): boolean {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return result.changes > 0;
}

// Category functions
export function getAllCategories(activeOnly = true): Category[] {
  const query = activeOnly
    ? 'SELECT * FROM categories WHERE active = 1 ORDER BY name'
    : 'SELECT * FROM categories ORDER BY name';
  return db.prepare(query).all() as Category[];
}

export function getCategoryById(id: string): Category | null {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | null;
  return category || null;
}

export function getCategoryBySlug(slug: string): Category | null {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as Category | null;
  return category || null;
}

export function createCategory(data: { name: string; slug: string; description?: string; image?: string }): string {
  const id = uuidv4();
  const stmt = db.prepare('INSERT INTO categories (id, name, slug, description, image) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, data.name, data.slug, data.description || null, data.image || null);
  return id;
}

export function updateCategory(id: string, data: Partial<Category>): boolean {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return false;

  values.push(id);
  const stmt = db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  return result.changes > 0;
}

export function deleteCategory(id: string): boolean {
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return result.changes > 0;
}

// Order functions
export function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  customer_notes?: string;
  delivery_method?: string;
  total: number;
  items: CartItem[];
  user_id?: string | null;
}): string {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO orders (id, customer_name, customer_phone, customer_email, customer_address, customer_notes, delivery_method, total, items, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.customer_name, data.customer_phone, data.customer_email || null, data.customer_address, data.customer_notes || null, data.delivery_method || 'delivery', data.total, JSON.stringify(data.items), data.user_id || null);

  // Award points if user is logged in
  if (data.user_id) {
    try {
      const pointsEarned = Math.floor(data.total / 100);
      if (pointsEarned > 0) {
        db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsEarned, data.user_id);
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  return id;
}

export function getAllOrders(): Order[] {
  return db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Order[];
}

export function getOrderById(id: string): Order | null {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | null;
  return order || null;
}

export function updateOrderStatus(id: string, status: string): boolean {
  const result = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  return result.changes > 0;
}

export function getRecentOrders(limit = 10): Order[] {
  return db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').all(limit) as Order[];
}

// Stats functions
export function getStats() {
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE active = 1').get() as { count: number };
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  const totalRevenue = db.prepare('SELECT SUM(total) as revenue FROM orders').get() as { revenue: number | null };
  const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get() as { count: number };
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get() as { count: number };
  const lowStockCount = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock < 10 AND active = 1").get() as { count: number };
  const pendingReviews = db.prepare("SELECT COUNT(*) as count FROM reviews WHERE approved = 0").get() as { count: number };
  const newsletterCount = db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers WHERE active = 1").get() as { count: number };

  const revenue = totalRevenue.revenue || 0;
  const averageTicket = totalOrders.count > 0 ? (revenue / totalOrders.count).toFixed(2) : 0;

  return {
    totalProducts: totalProducts.count,
    totalOrders: totalOrders.count,
    totalRevenue: revenue,
    pendingOrders: pendingOrders.count,
    totalUsers: totalUsers.count,
    averageTicket: Number(averageTicket),
    lowStockCount: lowStockCount.count,
    pendingReviews: pendingReviews.count,
    newsletterCount: newsletterCount.count,
  };
}

export function getLowStockProducts(limit = 5) {
  return db.prepare("SELECT id, name, stock FROM products WHERE stock < 10 AND active = 1 ORDER BY stock ASC LIMIT ?").all(limit) as { id: string, name: string, stock: number }[];
}
