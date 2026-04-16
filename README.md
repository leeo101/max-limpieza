# MAX Gestión de Artículos de Limpieza 🧼

Una plataforma e-commerce completa y profesional para la venta de artículos de limpieza, diseñada para ser moderna, responsive y lista para escalar como negocio real.

## 🚀 Características Principales

### Tienda Online
- ✅ Catálogo de productos con imágenes, descripción, precio y stock
- ✅ Categorías (detergentes, desengrasantes, perfuminas, limpieza automotriz, etc.)
- ✅ Buscador de productos en tiempo real
- ✅ Filtros por precio, categoría y popularidad
- ✅ Carrito de compras persistente
- ✅ Checkout simple con datos del cliente

### Notificación de Compras
- ✅ Registro automático de pedidos
- ✅ Integración con WhatsApp para notificaciones
- ✅ Resumen completo del pedido

### Panel Administrativo
- ✅ Login seguro con autenticación JWT
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Agregar, editar y eliminar productos
- ✅ Gestión de categorías
- ✅ Ver y gestionar pedidos
- ✅ Activar/desactivar productos
- ✅ Interfaz intuitiva y fácil de usar

### Diseño y Experiencia
- ✅ Diseño moderno, limpio y profesional
- ✅ 100% Responsive (optimizado para móviles)
- ✅ Colores relacionados a limpieza (azul, blanco, verde)
- ✅ Animaciones suaves y profesionales
- ✅ Botones grandes y fáciles de usar
- ✅ Optimización de velocidad

### Funciones Innovadoras
- ✅ **Compra rápida por WhatsApp** - Botón directo en cada producto
- ✅ **Productos más vendidos** - Sistema de recomendaciones
- ✅ **Calculadora de productos** - Cuánto necesito según uso
- ✅ **Consejos de limpieza** - Sección educativa
- ✅ **Combos y ofertas** - Packs de productos con descuento
- ✅ **Suscripción mensual** - Preparado para clientes frecuentes

## 📋 Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <repository-url>
   cd max-limpieza
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   copy .env.example .env.local
   ```
   
   Edita `.env.local` y configura:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: Tu número de WhatsApp con código de país
   - `JWT_SECRET`: Una clave secreta segura

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   - Tienda: http://localhost:3000
   - Admin: http://localhost:3000/admin/login

## 🔐 Credenciales de Administrador

**Demo:**
- Email: `admin@maxlimpieza.com`
- Contraseña: `admin123`

⚠️ **Importante:** Cambia la contraseña en producción por seguridad.

## 📱 Estructura del Proyecto

```
max-limpieza/
├── app/                      # Next.js App Router
│   ├── (rutas públicas)/     # Tienda online
│   │   ├── page.tsx          # Homepage
│   │   ├── tienda/           # Catálogo
│   │   ├── producto/         # Detalle de producto
│   │   ├── carrito/          # Carrito
│   │   ├── checkout/         # Checkout
│   │   ├── combos/           # Combos y ofertas
│   │   ├── consejos/         # Tips de limpieza
│   │   └── calculadora/      # Calculadora
│   ├── admin/                # Panel administrativo
│   │   ├── login/            # Login admin
│   │   ├── dashboard/        # Dashboard
│   │   ├── productos/        # Gestión de productos
│   │   ├── categorias/       # Gestión de categorías
│   │   └── pedidos/          # Gestión de pedidos
│   └── api/                  # API Routes
│       ├── products/
│       ├── orders/
│       ├── categories/
│       └── auth/
├── components/               # Componentes reutilizables
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── lib/                      # Utilidades y lógica
│   ├── db.ts                 # Base de datos SQLite
│   ├── products.ts           # Funciones de productos
│   └── auth.ts               # Autenticación
└── data/                     # Base de datos (autogenerado)
    └── max-limpieza.db
```

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)

1. Sube tu código a GitHub
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

```bash
npm i -g vercel
vercel
```

### Opción 2: Servidor VPS

1. **Construir la aplicación**
   ```bash
   npm run build
   ```

2. **Ejecutar en producción**
   ```bash
   npm start
   ```

3. **Usar PM2 para mantener el proceso**
   ```bash
   npm i -g pm2
   pm2 start npm --name "max-limpieza" -- start
   pm2 save
   ```

### Opción 3: Docker

```bash
docker build -t max-limpieza .
docker run -p 3000:3000 max-limpieza
```

## 💾 Base de Datos

El proyecto utiliza **SQLite** como base de datos, que:
- ✅ No requiere configuración
- ✅ Se crea automáticamente
- ✅ Es portable y fácil de respaldar
- ✅ Escala bien para negocios pequeños/medianos

### Respaldar la base de datos
```bash
cp data/max-limpieza.db data/max-limpieza.backup.db
```

### Migrar a PostgreSQL/MySQL en el futuro
El código está estructado para facilitar la migración a otro SGBD cuando el negocio escale.

## 🔧 Personalización

### Cambiar número de WhatsApp
Edita `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5491123456789
```

### Cambiar colores
Edita `app/globals.css` y modifica las variables CSS:
```css
:root {
  --primary: #0ea5e9;    /* Color principal */
  --secondary: #10b981;  /* Color secundario */
  --accent: #f59e0b;     /* Color de acento */
}
```

### Agregar productos
Desde el panel admin:
1. Inicia sesión en `/admin/login`
2. Ve a "Productos"
3. Click en "Agregar Producto"
4. Completa los campos y guarda

## 📈 Escalabilidad Futura

El proyecto está preparado para integrar:
- ✅ **Mercado Pago** - Pagos online
- ✅ **Firebase Storage** - Almacenamiento de imágenes
- ✅ **Nodemailer** - Envío de emails
- ✅ **App Móvil** - API lista para React Native/Flutter
- ✅ **Sistema de suscripciones** - Clientes frecuentes
- ✅ **Analytics** - Google Analytics integrado

## 🛡️ Seguridad

- ✅ Autenticación JWT para admin
- ✅ Validación de formularios
- ✅ Protección de rutas API
- ✅ Hash de contraseñas con bcrypt
- ✅ Preparado para HTTPS

## 📄 Licencia

Este proyecto es de uso comercial libre para el propietario.

## 🤝 Soporte

Para soporte técnico o consultas:
- WhatsApp: [Tu número]
- Email: admin@maxlimpieza.com

## 🎯 Roadmap Futuro

- [ ] Integración con Mercado Pago
- [ ] Sistema de envíos por email
- [ ] App móvil (React Native)
- [ ] Programa de puntos/fidelización
- [ ] Integración con WhatsApp Business API
- [ ] Sistema de inventario avanzado
- [ ] Reportes y analytics
- [ ] Multi-idioma

---

**Desarrollado con ❤️ para MAX Limpieza**

Next.js 14 | TypeScript | Tailwind CSS | SQLite
