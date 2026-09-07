# 🛒 E-Shop API

API REST de una tienda en línea construida con **Node.js, Express y Prisma (MySQL)**. Incluye autenticación con **JWT**, CRUD de categorías y productos, carrito de compras y pedidos con **transacciones** contra la base de datos.

> Proyecto 2 del portafolio para la postulación a **Practicante Backend – TEINOR S.A.C.**

## 🧰 Stack

- **Node.js 22** + **Express 5**
- **Prisma ORM** + **MySQL 8**
- **JWT** (`jsonwebtoken`) + **bcryptjs** para contraseñas
- **express-validator** para validación de entrada
- **Jest + Supertest** para pruebas (base separada `eshop_test_db`)

## ✨ Funcionalidades

| Endpoint | Descripción | Autenticación |
|---|---|---|
| `POST /auth/register` | Registrar usuario | No |
| `POST /auth/login` | Iniciar sesión → devuelve token JWT | No |
| `GET /categories` | Listar categorías | No |
| `POST /categories` | Crear categoría | No |
| `GET /products` | Listar productos (paginación, filtro por `category` y `search`) | No |
| `GET /products/:id` | Detalle de producto | No |
| `POST /products` | Crear producto | No |
| `GET /cart` | Ver carrito del usuario | Sí (Bearer) |
| `POST /cart` | Agregar producto al carrito | Sí (Bearer) |
| `PUT /cart/items/:id` | Cambiar cantidad | Sí (Bearer) |
| `DELETE /cart/items/:id` | Quitar ítem | Sí (Bearer) |
| `POST /orders/checkout` | Crear pedido (transacción) | Sí (Bearer) |
| `GET /orders` | Listar pedidos | Sí (Bearer) |
| `GET /orders/:id` | Detalle de pedido | Sí (Bearer) |
| `GET /health` | Estado del servidor | No |

## 🔄 Transacciones en el checkout

El punto fuerte de este proyecto es el uso de **`prisma.$transaction`**:

1. **Valida** el stock de todos los productos del carrito.
2. Dentro de una **única transacción**: descuenta el stock de cada producto y crea la orden con sus ítems y el total.
3. Si algo falla a mitad de camino, **MySQL hace ROLLBACK** y la base queda intacta.
4. Solo después de confirmar la orden se vacía el carrito.

Esto es lo que evitaría un **"producto vendido dos veces"** o un **"cobro sin stock"** en una tienda real.

## 🚀 Ponerla en marcha

```bash
# 1) Crear las bases en MySQL (usuario favio / clave eshop_pass)
sudo mysql -e "CREATE DATABASE IF NOT EXISTS eshop_db; CREATE DATABASE IF NOT EXISTS eshop_test_db; CREATE USER IF NOT EXISTS 'favio'@'localhost' IDENTIFIED BY 'eshop_pass'; GRANT ALL PRIVILEGES ON eshop_db.* TO 'favio'@'localhost'; GRANT ALL PRIVILEGES ON eshop_test_db.* TO 'favio'@'localhost'; FLUSH PRIVILEGES;"

# 2) Dependencias
npm install

# 3) Generar cliente y crear tablas
npx prisma generate
npx prisma db push                  # base de desarrollo
DATABASE_URL="mysql://favio:eshop_pass@localhost:3306/eshop_test_db" npx prisma db push --skip-generate   # base de pruebas

# 4) Configurar el entorno
cp .env.example .env   # editar JWT_SECRET

# 5) Levantar el servidor
npm run dev            # http://localhost:3000
```

## 🧪 Pruebas

```bash
npm test   # 8 pruebas → auth + flujo completo de compra en eshop_test_db
```

## 🔑 Colección de Postman

Importa `postman/collection.json`. Orden de uso:

1. **Auth → 2. Iniciar sesión** (guarda el token automáticamente en la variable `token`).
2. Crea una **categoría** y un **producto**.
3. Agrega el producto al **carrito**.
4. Ejecuta **Pedidos → Checkout** (transacción).

## 📁 Estructura

```
eshop-api/
├── prisma/schema.prisma      # Modelos User, Category, Product, CartItem, Order, OrderItem
├── src/
│   ├── app.js                # Configuración central de Express
│   ├── server.js             # Arranque del servidor
│   ├── routes/               # Enrutadores por recurso
│   ├── controllers/          # Lógica de negocio (incluye $transaction)
│   ├── middlewares/          # auth (JWT), errorHandler, validate
│   └── utils/                # AppError, catchAsync
├── tests/                    # Jest + Supertest
└── postman/collection.json   # Colección lista para importar
```

## 📜 Licencia

Proyecto educativo como parte del portafolio personal de **Favio Ordoñez Giribaldi**.