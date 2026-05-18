# 🍴 Foody Ocaña — Laravel 11 API + React 18

Stack completo: PHP/Laravel (backend seguro) + React/Vite (frontend moderno).

---

## 📁 Estructura

```
foody-laravel/                     ← Backend API REST
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php       ← Login, registro, email verify
│   │   │   ├── PedidoController.php     ← CRUD pedidos + estados
│   │   │   ├── RestauranteController.php← Panel restaurante + menú
│   │   │   ├── ProductoController.php   ← CRUD productos (en RestauranteController.php)
│   │   │   ├── WompiController.php      ← Pagos Colombia (Wompi)
│   │   │   ├── RepartidorController.php ← Panel repartidor + GPS
│   │   │   └── AdminController.php      ← Dashboard admin
│   │   └── Middleware/
│   │       └── RoleMiddleware.php       ← Protección por rol
│   └── Models/
│       ├── User.php                     ← Con roles y relaciones
│       └── Restaurante.php              ← + todos los modelos secundarios
├── database/
│   ├── migrations/                      ← Estructura BD completa
│   └── seeders/DatabaseSeeder.php       ← Datos demo
├── routes/api.php                       ← Todas las rutas
└── .env.example                         ← Variables necesarias

foody-react/                       ← Frontend SPA
├── src/
│   ├── api/client.js                    ← Axios + todos los endpoints
│   ├── context/AuthContext.jsx          ← Sesión global
│   ├── hooks/useCart.js                 ← Carrito (Zustand)
│   ├── pages/
│   │   ├── auth/          LoginPage, RegisterPage
│   │   └── cliente/       HomePage, RestaurantePage, CheckoutPage,
│   │                       PedidoDetallePage, MisPedidosPage
│   ├── App.jsx                          ← Router + guards por rol
│   └── index.css                        ← Design system
├── index.html
└── vite.config.js
```

---

## 🚀 Instalación

### Backend Laravel

```bash
cd foody-laravel
composer install
cp .env.example .env
php artisan key:generate

# Crear base de datos MySQL
mysql -u root -p -e "CREATE DATABASE foody_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Migraciones + datos demo
php artisan migrate --seed

# Link de storage para imágenes
php artisan storage:link

# Registrar middleware en bootstrap/app.php:
# ->withMiddleware(function (Middleware $middleware) {
#     $middleware->alias(['role' => \App\Http\Middleware\RoleMiddleware::class]);
# })

php artisan serve  # → http://localhost:8000
```

### Frontend React

```bash
cd foody-react
cp .env.example .env        # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                 # → http://localhost:5173
```

---

## 👥 Usuarios demo

| Rol         | Email                 | Password    |
|-------------|-----------------------|-------------|
| Admin       | admin@foody.co        | Admin123!   |
| Cliente     | cliente@foody.co      | Cliente123! |
| Restaurante | mansion@foody.co      | Rest123!    |
| Restaurante | bisonte@foody.co      | Rest123!    |
| Repartidor  | repartidor@foody.co   | Rep123!     |

---

## 💳 Wompi — Pagos

1. Cuenta en [wompi.com](https://wompi.com)
2. Desarrolladores → API Keys → copiar llaves Sandbox
3. En `.env`: `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_KEY`, `WOMPI_WEBHOOK_SECRET`
4. Webhook URL (en panel Wompi): `https://tudominio.com/api/pagos/webhook`
5. En `config/services.php` agregar:
```php
'wompi' => [
    'env'            => env('WOMPI_ENV', 'sandbox'),
    'public_key'     => env('WOMPI_PUBLIC_KEY'),
    'private_key'    => env('WOMPI_PRIVATE_KEY'),
    'integrity_key'  => env('WOMPI_INTEGRITY_KEY'),
    'webhook_secret' => env('WOMPI_WEBHOOK_SECRET'),
],
```

---

## 🌐 Hosting gratuito — Railway.app

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Agregar servicio MySQL
3. Variables de `.env` en Railway dashboard
4. Frontend en [Vercel](https://vercel.com) (gratis, conecta con GitHub)

---

## 🛡️ Seguridad implementada

- ✅ Laravel Sanctum — tokens JWT por rol con abilities
- ✅ RoleMiddleware — cada ruta protegida por rol
- ✅ Precios verificados en backend (nunca del cliente)
- ✅ Email verificado obligatorio antes de ingresar
- ✅ Firma HMAC-SHA256 para webhooks Wompi
- ✅ Firma de integridad en pagos Wompi
- ✅ DB transactions en creación de pedidos
- ✅ Passwords hasheados con bcrypt
- ✅ Rate limiting en rutas de autenticación
- ✅ CORS solo para dominio del frontend

---

## 📱 Siguiente paso — Play Store

```bash
cd foody-react
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Foody Ocaña" "co.foody.ocana"
npx cap add android
npx cap sync
npx cap open android
# Android Studio → Build → Generate Signed Bundle → Google Play
```
