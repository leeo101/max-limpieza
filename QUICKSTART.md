# 🚀 Guía de Inicio Rápido - MAX Limpieza

## Primeros Pasos (5 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar entorno
```bash
copy .env.example .env.local
```

Edita `.env.local` y cambia:
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: Tu número de WhatsApp (ej: 5491123456789)
- `JWT_SECRET`: Una clave segura (cualquier texto aleatorio)

### 3. Ejecutar la aplicación
```bash
npm run dev
```

### 4. Abrir en el navegador
- **Tienda:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

### 5. Credenciales de Admin
```
Email: admin@maxlimpieza.com
Contraseña: admin123
```

## ¿Qué viene incluido?

### ✅ Tienda Online Completa
- Homepage con productos destacados
- Catálogo con filtros y búsqueda
- Detalle de producto
- Carrito de compras
- Checkout completo

### ✅ Panel Administrativo
- Dashboard con estadísticas
- Gestión de productos (agregar, editar, eliminar)
- Gestión de categorías
- Gestión de pedidos
- Activar/desactivar productos

### ✅ Funciones Innovadoras
- Botón de WhatsApp en cada producto
- Calculadora de productos
- Consejos de limpieza
- Combos y ofertas
- Productos más vendidos

## Estructura de Archivos

```
max-limpieza/
├── app/                    # Páginas y API
│   ├── /                   # Tienda
│   ├── /admin              # Panel admin
│   └── /api                # APIs
├── components/             # Componentes
├── lib/                    # Lógica y DB
└── data/                   # Base de datos (auto)
```

## Tareas Comunes

### Agregar un Producto
1. Login admin: `/admin/login`
2. Ir a "Productos"
3. Click "Agregar Producto"
4. Completar campos y guardar

### Cambiar Número WhatsApp
Editar `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5491123456789
```

### Cambiar Colores
Editar `app/globals.css`:
```css
--primary: #0ea5e9;    /* Color principal */
--secondary: #10b981;  /* Color secundario */
```

### Ver Pedidos
1. Ir a `/admin/pedidos`
2. Filtrar por estado
3. Actualizar estado según corresponda

## Despliegue

### En Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### En tu servidor
```bash
npm run build
npm start
```

## Soporte

¿Problemas?
- Revisa este README
- Verifica que las variables de entorno estén correctas
- Asegúrate de tener Node.js 18+

## ¡Listo!

Tu tienda de artículos de limpieza está lista para usar. ¡Éxito con tu negocio! 🎉

---

**Documentación completa:** Ver README.md
