# TuningShop Frontend — Design Spec
Date: 2026-05-17

## Overview

React + Vite frontend для магазина автозапчастей. Бекенд — FastAPI (`http://localhost:8000`), документация API в `../tuning-shop-backend/API.md`. Два типа пользователей: покупатель и администратор.

---

## Stack

- **React + Vite** — основа проекта
- **Tailwind CSS v4** — стили
- **Lucide React** — иконки
- **React Router v7** — навигация
- **axios** — HTTP клиент
- **Context API** — глобальное состояние (Auth + Cart)

---

## Структура проекта

```
src/
├── api/
│   ├── client.js           axios instance + interceptors
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── manufacturers.js
│   ├── cars.js
│   ├── orders.js
│   └── users.js
├── contexts/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── pages/
│   ├── Home.jsx            (готово)
│   ├── Catalog.jsx
│   ├── Product.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Orders.jsx
│   ├── OrderDetail.jsx
│   ├── Profile.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Orders.jsx
│       ├── Users.jsx
│       ├── Categories.jsx
│       ├── Manufacturers.jsx
│       └── Cars.jsx
└── App.jsx                 роутер + провайдеры
```

---

## Роутинг

### Клиентская часть

| Путь | Компонент | Доступ |
|---|---|---|
| `/` | Home | публичный |
| `/catalog` | Catalog | публичный |
| `/product/:id` | Product | публичный |
| `/cart` | Cart | публичный |
| `/checkout` | Checkout | 🔒 авторизован |
| `/orders` | Orders | 🔒 авторизован |
| `/orders/:id` | OrderDetail | 🔒 авторизован |
| `/profile` | Profile | 🔒 авторизован |
| `/login` | Login | публичный |
| `/register` | Register | публичный |

### Админпанель (отдельный layout с sidebar)

| Путь | Компонент | Доступ |
|---|---|---|
| `/admin` | Dashboard | 👑 admin |
| `/admin/products` | Products | 👑 admin |
| `/admin/orders` | Orders | 👑 admin |
| `/admin/users` | Users | 👑 admin |
| `/admin/categories` | Categories | 👑 admin |
| `/admin/manufacturers` | Manufacturers | 👑 admin |
| `/admin/cars` | Cars | 👑 admin |

**ProtectedRoute** — редиректит на `/login` если нет токена.  
**AdminRoute** — редиректит на `/` если роль не `admin`.

---

## Контексты

### AuthContext

- **Хранит:** `user` (UserOut), `token` (string), `loading` (bool)
- **При старте:** читает токен из `localStorage`, делает `GET /users/me`
- **Методы:** `login(username, password)`, `logout()`
- **Computed:** `isAdmin` (boolean)
- Токен прокидывается в axios через request interceptor — компоненты не работают с токеном напрямую

### CartContext

- **Хранит:** `items: Array<{ product_id, product_name, price, quantity, image_url }>`
- **Персистентность:** `localStorage`, синхронизация между вкладками
- **Методы:** `addToCart(product)`, `removeFromCart(id)`, `updateQty(id, qty)`, `clearCart()`
- Корзина локальная — заказ создаётся на бекенде только при оформлении (`POST /orders/`)
- Количество товаров отображается в хедере

---

## API слой

### `src/api/client.js`

- `baseURL: http://localhost:8000`
- Request interceptor — добавляет `Authorization: Bearer <token>` из localStorage
- Response interceptor — при 401 вызывает logout и редиректит на `/login`

### Модули

```
auth.js          login(username, password), register(data)
products.js      getProducts(params), getProduct(id),
                 createProduct(data), updateProduct(id, data), deleteProduct(id),
                 addCompatibility(productId, carId), removeCompatibility(productId, carId)
categories.js    getCategories(), createCategory(name), deleteCategory(id)
manufacturers.js getManufacturers(), createManufacturer(name), deleteManufacturer(id)
cars.js          getBrands(), createBrand(name),
                 getModels(brandId?), createModel(data),
                 getCars(modelId?), getCar(id), createCar(data), deleteCar(id)
orders.js        createOrder(data), getMyOrders(), getOrder(id),
                 getAllOrders(), updateOrderStatus(id, statusId)
users.js         getMe(), updateMe(data), getAllUsers(), getUser(id), updateRole(id, roleId)
```

Компоненты вызывают только эти функции — URL'ы и axios нигде больше не появляются.

---

## Порядок разработки

| Этап | Содержание | Результат |
|---|---|---|
| 3 | API клиент + модули + AuthContext + роутинг + ProtectedRoute/AdminRoute | Логин/регистрация работают |
| 4 | CartContext + страницы Login / Register | Вход, выход, корзина в localStorage |
| 5 | Каталог `/catalog` с фильтрами (категория, производитель, авто) | Живые товары из API |
| 6 | Карточка товара `/product/:id` + «В корзину» | Открытие товара, добавление в корзину |
| 7 | Корзина `/cart` + Оформление `/checkout` | Полный флоу покупки, заказ в БД |
| 8 | Мои заказы `/orders`, `/orders/:id` + Профиль `/profile` | Покупатель видит заказы и профиль |
| 9 | Admin layout + Dashboard + Управление товарами | Базовая админпанель |
| 10 | Заказы / Пользователи / Справочники в админке | Полная админпанель |

---

## Админ-контролы в клиентском UI

Администратор видит дополнительные элементы управления прямо в публичном интерфейсе:

- На карточке товара в каталоге — кнопки «Редактировать» и «Удалить»
- На странице товара `/product/:id` — те же кнопки + управление совместимостью с авто
- В хедере — ссылка «Админпанель» ведущая на `/admin`

Эти элементы рендерятся только если `isAdmin === true` (из AuthContext). Полное управление — через `/admin/*`.

---

## Дизайн

- Тёмная тема: `bg-gray-950` / `bg-gray-900`
- Акцент: `orange-500` / `orange-400`
- Шрифт: системный sans-serif
- Иконки: Lucide React
- Главная страница уже готова и задаёт визуальный стиль
