import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const dbPath = isVercel 
  ? path.join('/tmp', 'max-limpieza.db') 
  : path.join(process.cwd(), 'data', 'max-limpieza.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
  // Create users table with customer support
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      points INTEGER DEFAULT 0,
      verification_token TEXT,
      email_verified INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category_id TEXT,
      image TEXT,
      images TEXT,
      sku TEXT UNIQUE,
      active INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      bestseller INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      customer_address TEXT NOT NULL,
      customer_notes TEXT,
      delivery_method TEXT DEFAULT 'delivery',
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      items TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      products TEXT NOT NULL,
      image TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      plan TEXT NOT NULL,
      frequency TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Add delivery_method column if it doesn't exist (migration)
  try {
    db.prepare("ALTER TABLE orders ADD COLUMN delivery_method TEXT DEFAULT 'delivery'").run();
  } catch {
    // Column already exists, ignore error
  }

  // Add user_id to orders if it doesn't exist (migration)
  try {
    db.prepare("ALTER TABLE orders ADD COLUMN user_id TEXT").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)").run();
  } catch {
    // Column already exists, ignore error
  }

  // Add email index for faster lookups
  try {
    db.prepare("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)").run();
  } catch {
    // Column already exists, ignore error
  }

  // Add customer fields to users table if they don't exist (migration)
  const customerFields = [
    "ALTER TABLE users ADD COLUMN name TEXT",
    "ALTER TABLE users ADD COLUMN phone TEXT",
    "ALTER TABLE users ADD COLUMN address TEXT",
    "ALTER TABLE users ADD COLUMN city TEXT",
    "ALTER TABLE users ADD COLUMN postal_code TEXT",
    "ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN verification_token TEXT",
    "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1",
    "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
  ];

  customerFields.forEach(sql => {
    try {
      db.prepare(sql).run();
    } catch {
      // Column already exists, ignore error
    }
  });

  // Add reviews index for faster lookups
  try {
    db.prepare("CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved)").run();
  } catch {
    // Index already exists, ignore error
  }

  // Create password_resets table if it doesn't exist
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  } catch {
    // Table already exists, ignore error
  }

  // Insert default admin user (password: admin123)
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  db.exec(`
    INSERT OR IGNORE INTO users (id, email, password, role, name, active)
    VALUES ('admin-001', 'admin@maxlimpieza.com', '${hashedPassword}', 'admin', 'Administrador', 1);
  `);

  // Insert default categories
  const defaultCategories = [
    { id: 'cat-001', name: 'Detergentes', slug: 'detergentes', description: 'Detergentes líquidos y en polvo para todo tipo de superficies' },
    { id: 'cat-002', name: 'Desengrasantes', slug: 'desengrasantes', description: 'Desengrasantes industriales y domésticos de alta potencia' },
    { id: 'cat-003', name: 'Perfuminas', slug: 'perfuminas', description: 'Ambientadores y perfumes para el hogar' },
    { id: 'cat-004', name: 'Limpieza Automotriz', slug: 'limpieza-automotriz', description: 'Productos especializados para vehículos' },
    { id: 'cat-005', name: 'Desinfectantes', slug: 'desinfectantes', description: 'Desinfectantes y antibacteriales' },
    { id: 'cat-006', name: 'Accesorios', slug: 'accesorios', description: 'Escobas, trapos, esponjas y más' },
    { id: 'cat-007', name: 'Jabón de Ropa', slug: 'jabon-ropa', description: 'Jabones líquidos y en polvo para lavar la ropa' },
  ];

  defaultCategories.forEach(cat => {
    db.exec(`
      INSERT OR IGNORE INTO categories (id, name, slug, description) 
      VALUES ('${cat.id}', '${cat.name}', '${cat.slug}', '${cat.description}');
    `);
  });

  // Insert sample products
  const sampleProducts = [
    { id: 'prod-001', name: 'Detergente Líquido Premium 1L', description: 'Detergente líquido concentrado biodegradable, ideal para todo tipo de superficies. Rinde hasta 50 limpiezas.', price: 850, stock: 100, category_id: 'cat-001', featured: 1, bestseller: 1 },
    { id: 'prod-002', name: 'Detergente en Polvo 500g', description: 'Detergente en polvo de alta concentración con fórmulas activa contra la grasa.', price: 650, stock: 80, category_id: 'cat-001', featured: 0, bestseller: 1 },
    { id: 'prod-003', name: 'Desengrasante Industrial 1L', description: 'Desengrasante profesional para cocinas industriales, motores y maquinaria. Acción rápida.', price: 1200, stock: 50, category_id: 'cat-002', featured: 1, bestseller: 0 },
    { id: 'prod-004', name: 'Ambientador Lavanda 500ml', description: 'Perfume ambiental de larga duración con aroma a lavanda fresca. Elimina malos olores.', price: 750, stock: 120, category_id: 'cat-003', featured: 1, bestseller: 1 },
    { id: 'prod-005', name: 'Shampoo Automotriz 1L', description: 'Shampoo especial para vehículos con cera integrada. Protege la pintura.', price: 1500, stock: 40, category_id: 'cat-004', featured: 0, bestseller: 0 },
    { id: 'prod-006', name: 'Desinfectante Multiusos 1L', description: 'Desinfectante antibacterial que elimina el 99.9% de gérmenes y bacterias.', price: 900, stock: 90, category_id: 'cat-005', featured: 1, bestseller: 1 },
    { id: 'prod-007', name: 'Kit de Limpieza Básico', description: 'Incluye: escoba, recogedor, trapo de piso y esponja multiusos.', price: 2500, stock: 30, category_id: 'cat-006', featured: 1, bestseller: 0 },
    { id: 'prod-008', name: 'Limpiavidrios 500ml', description: 'Limpiavidrios profesional sin rayas. Secado rápido con brillo extra.', price: 680, stock: 70, category_id: 'cat-001', featured: 0, bestseller: 0 },
  ];

  sampleProducts.forEach(prod => {
    db.exec(`
      INSERT OR IGNORE INTO products (id, name, description, price, stock, category_id, featured, bestseller) 
      VALUES ('${prod.id}', '${prod.name.replace(/'/g, "''")}', '${prod.description.replace(/'/g, "''")}', ${prod.price}, ${prod.stock}, '${prod.category_id}', ${prod.featured}, ${prod.bestseller});
    `);
  });

  // Insert sample tips
  const sampleTips = [
    { id: 'tip-001', title: 'Cómo limpiar pisos de cerámica correctamente', content: 'Para limpiar pisos de cerámica de forma efectiva, utiliza agua tibia con detergente líquido. Limpia en secciones y cambia el agua cuando esté sucia. Para brillo extra, agrega una cucharada de vinagre blanco.', category: 'Pisos' },
    { id: 'tip-002', title: 'Elimina manchas de grasa en la cocina', content: 'Aplica desengrasante industrial directamente sobre la mancha, deja actuar 5 minutos y frota con esponja no abrasiva. Para manchas difíciles, repite el proceso.', category: 'Cocina' },
    { id: 'tip-003', title: 'Mantén tu auto limpio por más tiempo', content: 'Lava tu auto semanalmente con shampoo automotriz (nunca uses detergente). Seca con paño de microfibra para evitar manchas de agua. Aplica cera protectora mensual.', category: 'Automotriz' },
  ];

  sampleTips.forEach(tip => {
    db.exec(`
      INSERT OR IGNORE INTO tips (id, title, content, category) 
      VALUES ('${tip.id}', '${tip.title.replace(/'/g, "''")}', '${tip.content.replace(/'/g, "''")}', '${tip.category}');
    `);
  });

  // Insert sample combos
  const sampleCombos = [
    { id: 'combo-001', name: 'Pack Limpieza Total del Hogar', description: 'Todo lo que necesitas para una limpieza completa', price: 3500, original_price: 4500, products: 'Detergente 1L, Desinfectante 1L, Ambientador 500ml' },
    { id: 'combo-002', name: 'Kit Automotriz Premium', description: 'Productos profesionales para el cuidado de tu vehículo', price: 4200, original_price: 5500, products: 'Shampoo 1L, Cera Líquida, Paño Microfibra' },
  ];

  sampleCombos.forEach(combo => {
    db.exec(`
      INSERT OR IGNORE INTO combos (id, name, description, price, original_price, products) 
      VALUES ('${combo.id}', '${combo.name.replace(/'/g, "''")}', '${combo.description.replace(/'/g, "''")}', ${combo.price}, ${combo.original_price}, '${combo.products.replace(/'/g, "''")}');
    `);
  });
}

// Initialize database on import
initializeDatabase();

export default db;
