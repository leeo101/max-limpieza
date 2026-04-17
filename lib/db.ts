import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const sql = postgres(process.env.DATABASE_URL as string, {
  ssl: 'require',
  prepare: false, // Required for PgBouncer in Supabase transaction pooler (port 6543)
});

// Initialize database tables
export async function initializeDatabase() {
  // Create users table with customer support
  await sql`
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `;

  await sql`
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
      user_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      products TEXT NOT NULL,
      image TEXT,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      plan TEXT NOT NULL,
      frequency TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      active INTEGER DEFAULT 1
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  // Indexes (in postgres we don't catch failures for CREATE INDEX IF NOT EXISTS generally)
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved)`;

  // Delete old admin and insert new admin user
  await sql`DELETE FROM users WHERE email = 'admin@maxlimpieza.com'`;

  const hashedPassword = bcrypt.hashSync('EnzoRodriguez10', 10);
  await sql`
    INSERT INTO users (id, email, password, role, name, active)
    VALUES ('admin-002', 'enzorodriguez31@gmail.com', ${hashedPassword}, 'admin', 'Administrador', 1)
    ON CONFLICT (email) DO UPDATE SET password = ${hashedPassword};
  `;

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

  for (const cat of defaultCategories) {
    await sql`
      INSERT INTO categories (id, name, slug, description) 
      VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

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

  for (const prod of sampleProducts) {
    await sql`
      INSERT INTO products (id, name, description, price, stock, category_id, featured, bestseller) 
      VALUES (${prod.id}, ${prod.name}, ${prod.description}, ${prod.price}, ${prod.stock}, ${prod.category_id}, ${prod.featured}, ${prod.bestseller})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // Insert sample tips
  const sampleTips = [
    { id: 'tip-001', title: 'Cómo limpiar pisos de cerámica correctamente', content: 'Para limpiar pisos de cerámica de forma efectiva, utiliza agua tibia con detergente líquido. Limpia en secciones y cambia el agua cuando esté sucia. Para brillo extra, agrega una cucharada de vinagre blanco.', category: 'Pisos' },
    { id: 'tip-002', title: 'Elimina manchas de grasa en la cocina', content: 'Aplica desengrasante industrial directamente sobre la mancha, deja actuar 5 minutos y frota con esponja no abrasiva. Para manchas difíciles, repite el proceso.', category: 'Cocina' },
    { id: 'tip-003', title: 'Mantén tu auto limpio por más tiempo', content: 'Lava tu auto semanalmente con shampoo automotriz (nunca uses detergente). Seca con paño de microfibra para evitar manchas de agua. Aplica cera protectora mensual.', category: 'Automotriz' },
  ];

  for (const tip of sampleTips) {
    await sql`
      INSERT INTO tips (id, title, content, category) 
      VALUES (${tip.id}, ${tip.title}, ${tip.content}, ${tip.category})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  const sampleCombos = [
    { id: 'combo-001', name: 'Pack Limpieza Total del Hogar', description: 'Todo lo que necesitas para una limpieza completa', price: 3500, original_price: 4500, products: 'Detergente 1L, Desinfectante 1L, Ambientador 500ml' },
    { id: 'combo-002', name: 'Kit Automotriz Premium', description: 'Productos profesionales para el cuidado de tu vehículo', price: 4200, original_price: 5500, products: 'Shampoo 1L, Cera Líquida, Paño Microfibra' },
  ];

  for (const combo of sampleCombos) {
    await sql`
      INSERT INTO combos (id, name, description, price, original_price, products) 
      VALUES (${combo.id}, ${combo.name}, ${combo.description}, ${combo.price}, ${combo.original_price}, ${combo.products})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

export default sql;
