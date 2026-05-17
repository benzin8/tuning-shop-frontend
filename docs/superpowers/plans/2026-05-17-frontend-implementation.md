# TuningShop Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Построить полноценный фронтенд магазина автозапчастей — клиентская часть + админпанель — с подключением к FastAPI бекенду.

**Architecture:** React Router v7 для навигации, два Context'а (AuthContext, CartContext) для глобального состояния, централизованный axios API-слой в `src/api/`. Клиентские маршруты и `/admin/*` имеют разные layouts. Верификация каждого этапа — через браузер на `http://localhost:5173`.

**Tech Stack:** React 18, Vite, Tailwind CSS v4, Lucide React, React Router v7, axios, Context API

**Бекенд:** `http://localhost:8000` — должен быть запущен перед проверкой в браузере.

---

## Карта файлов

| Файл | Статус | Назначение |
|---|---|---|
| `src/api/client.js` | создать | axios instance + interceptors |
| `src/api/auth.js` | создать | login, register |
| `src/api/products.js` | создать | CRUD товаров + совместимость |
| `src/api/categories.js` | создать | CRUD категорий |
| `src/api/manufacturers.js` | создать | CRUD производителей |
| `src/api/cars.js` | создать | бренды, модели, авто |
| `src/api/orders.js` | создать | заказы |
| `src/api/users.js` | создать | пользователи |
| `src/contexts/AuthContext.jsx` | создать | токен, user, login/logout |
| `src/contexts/CartContext.jsx` | создать | корзина в localStorage |
| `src/components/ProtectedRoute.jsx` | создать | редирект на /login |
| `src/components/AdminRoute.jsx` | создать | редирект на / если не admin |
| `src/components/Footer.jsx` | создать | подвал сайта |
| `src/components/Header.jsx` | изменить | счётчик корзины, ссылка админки |
| `src/App.jsx` | изменить | Router + провайдеры + все маршруты |
| `src/pages/Login.jsx` | создать | форма входа |
| `src/pages/Register.jsx` | создать | форма регистрации |
| `src/pages/Catalog.jsx` | создать | список товаров с фильтрами |
| `src/pages/Product.jsx` | создать | карточка товара |
| `src/pages/Cart.jsx` | создать | корзина |
| `src/pages/Checkout.jsx` | создать | оформление заказа |
| `src/pages/Orders.jsx` | создать | мои заказы |
| `src/pages/OrderDetail.jsx` | создать | детали заказа |
| `src/pages/Profile.jsx` | создать | профиль пользователя |
| `src/pages/admin/AdminLayout.jsx` | создать | sidebar-layout для /admin |
| `src/pages/admin/Dashboard.jsx` | создать | сводка |
| `src/pages/admin/Products.jsx` | создать | управление товарами |
| `src/pages/admin/Orders.jsx` | создать | управление заказами |
| `src/pages/admin/Users.jsx` | создать | управление пользователями |
| `src/pages/admin/Categories.jsx` | создать | управление категориями |
| `src/pages/admin/Manufacturers.jsx` | создать | управление производителями |
| `src/pages/admin/Cars.jsx` | создать | управление авто |

---

## Task 1: Установка зависимостей

**Files:**
- Modify: `package.json` (через npm install)

- [ ] **Step 1: Установить react-router-dom и axios**

```bash
cd ~/projects/tuning-shop-frontend
npm install react-router-dom axios
```

Ожидаемый вывод: `added N packages` без ошибок (EBADENGINE warnings — норма, не ошибки).

- [ ] **Step 2: Проверить установку**

```bash
node -e "require('./node_modules/react-router-dom'); require('./node_modules/axios'); console.log('OK')"
```

Ожидаемый вывод: `OK`

- [ ] **Step 3: Commit**

```bash
git init && git add package.json package-lock.json
git commit -m "feat: add react-router-dom and axios"
```

---

## Task 2: API клиент

**Files:**
- Create: `src/api/client.js`

- [ ] **Step 1: Создать axios instance**

`src/api/client.js`:
```js
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
```

- [ ] **Step 2: Commit**

```bash
git add src/api/client.js
git commit -m "feat: add axios client with auth interceptors"
```

---

## Task 3: API модули

**Files:**
- Create: `src/api/auth.js`
- Create: `src/api/products.js`
- Create: `src/api/categories.js`
- Create: `src/api/manufacturers.js`
- Create: `src/api/cars.js`
- Create: `src/api/orders.js`
- Create: `src/api/users.js`

- [ ] **Step 1: Создать src/api/auth.js**

```js
import client from './client'

export const login = (username, password) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return client.post('/auth/login', form)
}

export const register = (data) => client.post('/auth/register', data)
```

> Login использует `application/x-www-form-urlencoded` — именно поэтому URLSearchParams, а не JSON.

- [ ] **Step 2: Создать src/api/products.js**

```js
import client from './client'

export const getProducts = (params) => client.get('/products/', { params })
export const getProduct = (id) => client.get(`/products/${id}`)
export const createProduct = (data) => client.post('/products/', data)
export const updateProduct = (id, data) => client.patch(`/products/${id}`, data)
export const deleteProduct = (id) => client.delete(`/products/${id}`)
export const addCompatibility = (productId, carId) =>
  client.post(`/products/${productId}/compatibility`, { product_id: productId, car_id: carId })
export const removeCompatibility = (productId, carId) =>
  client.delete(`/products/${productId}/compatibility/${carId}`)
```

- [ ] **Step 3: Создать src/api/categories.js**

```js
import client from './client'

export const getCategories = () => client.get('/categories/')
export const createCategory = (category_name) => client.post('/categories/', { category_name })
export const deleteCategory = (id) => client.delete(`/categories/${id}`)
```

- [ ] **Step 4: Создать src/api/manufacturers.js**

```js
import client from './client'

export const getManufacturers = () => client.get('/manufacturers/')
export const createManufacturer = (manufacturer_name) =>
  client.post('/manufacturers/', { manufacturer_name })
export const deleteManufacturer = (id) => client.delete(`/manufacturers/${id}`)
```

- [ ] **Step 5: Создать src/api/cars.js**

```js
import client from './client'

export const getBrands = () => client.get('/cars/brands/')
export const createBrand = (brand_name) => client.post('/cars/brands/', { brand_name })
export const getModels = (brand_id) => client.get('/cars/models/', { params: brand_id ? { brand_id } : {} })
export const createModel = (data) => client.post('/cars/models/', data)
export const getCars = (model_id) => client.get('/cars/', { params: model_id ? { model_id } : {} })
export const getCar = (id) => client.get(`/cars/${id}`)
export const createCar = (data) => client.post('/cars/', data)
export const deleteCar = (id) => client.delete(`/cars/${id}`)
```

- [ ] **Step 6: Создать src/api/orders.js**

```js
import client from './client'

export const createOrder = (data) => client.post('/orders/', data)
export const getMyOrders = () => client.get('/orders/my')
export const getOrder = (id) => client.get(`/orders/${id}`)
export const getAllOrders = () => client.get('/orders/')
export const updateOrderStatus = (id, status_id) =>
  client.patch(`/orders/${id}/status`, { status_id })
```

- [ ] **Step 7: Создать src/api/users.js**

```js
import client from './client'

export const getMe = () => client.get('/users/me')
export const updateMe = (data) => client.patch('/users/me', data)
export const getAllUsers = () => client.get('/users/')
export const getUser = (id) => client.get(`/users/${id}`)
export const updateRole = (id, role_id) => client.patch(`/users/${id}/role`, { role_id })
```

- [ ] **Step 8: Commit**

```bash
git add src/api/
git commit -m "feat: add API modules for all resources"
```

---

## Task 4: AuthContext

**Files:**
- Create: `src/contexts/AuthContext.jsx`

- [ ] **Step 1: Создать контекст**

`src/contexts/AuthContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../api/auth'
import { getMe } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await apiLogin(username, password)
    localStorage.setItem('token', res.data.access_token)
    const me = await getMe()
    setUser(me.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = user?.role?.role_name === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/AuthContext.jsx
git commit -m "feat: add AuthContext with login/logout and isAdmin"
```

---

## Task 5: CartContext

**Files:**
- Create: `src/contexts/CartContext.jsx`

- [ ] **Step 1: Создать контекст**

`src/contexts/CartContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.product_id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (product_id) =>
    setItems(prev => prev.filter(i => i.product_id !== product_id))

  const updateQty = (product_id, quantity) => {
    if (quantity < 1) { removeFromCart(product_id); return }
    setItems(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/CartContext.jsx
git commit -m "feat: add CartContext with localStorage persistence"
```

---

## Task 6: ProtectedRoute, AdminRoute, Footer

**Files:**
- Create: `src/components/ProtectedRoute.jsx`
- Create: `src/components/AdminRoute.jsx`
- Create: `src/components/Footer.jsx`

- [ ] **Step 1: Создать ProtectedRoute**

`src/components/ProtectedRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-gray-950" />
  if (!user) return <Navigate to="/login" replace />
  return children
}
```

- [ ] **Step 2: Создать AdminRoute**

`src/components/AdminRoute.jsx`:
```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="min-h-screen bg-gray-950" />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
```

- [ ] **Step 3: Создать Footer**

`src/components/Footer.jsx`:
```jsx
import { Wrench } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2 text-orange-500 font-bold">
          <Wrench size={16} />
          TuningShop
        </div>
        <div className="flex gap-6">
          <a href="/catalog" className="hover:text-gray-200 transition-colors">Каталог</a>
          <a href="#" className="hover:text-gray-200 transition-colors">Доставка</a>
          <a href="#" className="hover:text-gray-200 transition-colors">Возврат</a>
        </div>
        <div>© 2025 TuningShop</div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ProtectedRoute.jsx src/components/AdminRoute.jsx src/components/Footer.jsx
git commit -m "feat: add ProtectedRoute, AdminRoute, Footer"
```

---

## Task 7: Обновить Header + подключить роутер в App.jsx

**Files:**
- Modify: `src/components/Header.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Обновить Header.jsx**

Полностью заменить содержимое `src/components/Header.jsx`:
```jsx
import { Wrench, ShoppingCart, User, Menu, X, Search, LayoutDashboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-orange-500 font-bold text-xl shrink-0">
          <Wrench size={22} />
          <span>TuningShop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-300">
          <Link to="/catalog" className="hover:text-white transition-colors">Каталог</Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors">
              <LayoutDashboard size={15} />
              Админпанель
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/catalog" className="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <Search size={19} />
          </Link>
          <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <ShoppingCart size={19} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/profile" className="p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
                <User size={19} />
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800">
                <LogOut size={19} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
              <User size={19} />
            </Link>
          )}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-4 flex flex-col gap-4 text-sm text-gray-300">
          <Link to="/catalog" onClick={() => setMobileOpen(false)} className="hover:text-white">Каталог</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="hover:text-white">Корзина {totalItems > 0 && `(${totalItems})`}</Link>
          {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-orange-400">Админпанель</Link>}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="hover:text-white">Профиль</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-left text-red-400">Выйти</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="hover:text-white">Войти</Link>
          )}
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Обновить App.jsx — подключить Router + провайдеры + все маршруты**

Полностью заменить содержимое `src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminCategories from './pages/admin/Categories'
import AdminManufacturers from './pages/admin/Manufacturers'
import AdminCars from './pages/admin/Cars'

function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Клиентские маршруты */}
            <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
            <Route path="/catalog" element={<ClientLayout><Catalog /></ClientLayout>} />
            <Route path="/product/:id" element={<ClientLayout><Product /></ClientLayout>} />
            <Route path="/cart" element={<ClientLayout><Cart /></ClientLayout>} />
            <Route path="/login" element={<ClientLayout><Login /></ClientLayout>} />
            <Route path="/register" element={<ClientLayout><Register /></ClientLayout>} />
            <Route path="/checkout" element={<ClientLayout><ProtectedRoute><Checkout /></ProtectedRoute></ClientLayout>} />
            <Route path="/orders" element={<ClientLayout><ProtectedRoute><Orders /></ProtectedRoute></ClientLayout>} />
            <Route path="/orders/:id" element={<ClientLayout><ProtectedRoute><OrderDetail /></ProtectedRoute></ClientLayout>} />
            <Route path="/profile" element={<ClientLayout><ProtectedRoute><Profile /></ProtectedRoute></ClientLayout>} />

            {/* Админ маршруты */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="manufacturers" element={<AdminManufacturers />} />
              <Route path="cars" element={<AdminCars />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Создать заглушки для всех страниц которых ещё нет**

Создать каждый файл с минимальным содержимым чтобы App.jsx компилировался:

`src/pages/Catalog.jsx`: `export default function Catalog() { return <div className="p-8 text-white">Catalog — coming soon</div> }`

`src/pages/Product.jsx`: `export default function Product() { return <div className="p-8 text-white">Product — coming soon</div> }`

`src/pages/Cart.jsx`: `export default function Cart() { return <div className="p-8 text-white">Cart — coming soon</div> }`

`src/pages/Checkout.jsx`: `export default function Checkout() { return <div className="p-8 text-white">Checkout — coming soon</div> }`

`src/pages/Orders.jsx`: `export default function Orders() { return <div className="p-8 text-white">Orders — coming soon</div> }`

`src/pages/OrderDetail.jsx`: `export default function OrderDetail() { return <div className="p-8 text-white">OrderDetail — coming soon</div> }`

`src/pages/Profile.jsx`: `export default function Profile() { return <div className="p-8 text-white">Profile — coming soon</div> }`

`src/pages/Login.jsx`: `export default function Login() { return <div className="p-8 text-white">Login — coming soon</div> }`

`src/pages/Register.jsx`: `export default function Register() { return <div className="p-8 text-white">Register — coming soon</div> }`

```bash
mkdir -p src/pages/admin
```

`src/pages/admin/AdminLayout.jsx`:
```jsx
import { Outlet } from 'react-router-dom'
export default function AdminLayout() { return <div className="min-h-screen bg-gray-950 text-white"><Outlet /></div> }
```

`src/pages/admin/Dashboard.jsx`: `export default function Dashboard() { return <div className="p-8">Dashboard</div> }`

`src/pages/admin/Products.jsx`: `export default function AdminProducts() { return <div className="p-8">Products</div> }`

`src/pages/admin/Orders.jsx`: `export default function AdminOrders() { return <div className="p-8">Orders</div> }`

`src/pages/admin/Users.jsx`: `export default function AdminUsers() { return <div className="p-8">Users</div> }`

`src/pages/admin/Categories.jsx`: `export default function AdminCategories() { return <div className="p-8">Categories</div> }`

`src/pages/admin/Manufacturers.jsx`: `export default function AdminManufacturers() { return <div className="p-8">Manufacturers</div> }`

`src/pages/admin/Cars.jsx`: `export default function AdminCars() { return <div className="p-8">Cars</div> }`

- [ ] **Step 4: Проверить что проект компилируется**

```bash
npm run dev
```

Открыть `http://localhost:5173` — должна открыться главная страница с хедером и футером. При клике на «Каталог» URL меняется на `/catalog`.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: wire up router, contexts, layouts and stub pages"
```

---

## Task 8: Страница Login

**Files:**
- Modify: `src/pages/Login.jsx`

- [ ] **Step 1: Реализовать Login.jsx**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setError('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <Wrench size={22} />
            TuningShop
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Вход в аккаунт</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Проверить в браузере**

1. Открыть `http://localhost:5173/login`
2. Ввести неверный пароль — должна появиться ошибка «Неверный логин или пароль»
3. Ввести верные данные — должен произойти редирект на `/`
4. В хедере должна появиться иконка User вместо Login

- [ ] **Step 3: Commit**

```bash
git add src/pages/Login.jsx
git commit -m "feat: add Login page"
```

---

## Task 9: Страница Register

**Files:**
- Modify: `src/pages/Register.jsx`

- [ ] **Step 1: Реализовать Register.jsx**

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { register } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ ...form, phone: form.phone || null })
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        required={key !== 'phone'}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <Wrench size={22} />
            TuningShop
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Регистрация</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {field('Имя пользователя', 'username', 'text', 'username')}
            {field('Email', 'email', 'email', 'you@example.com')}
            {field('Телефон (необязательно)', 'phone', 'tel', '+7 900 000 00 00')}
            {field('Пароль (мин. 6 символов)', 'password', 'password', '••••••')}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Регистрируем...' : 'Создать аккаунт'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Проверить в браузере**

1. Открыть `http://localhost:5173/register`
2. Заполнить форму, нажать «Создать аккаунт»
3. После успешной регистрации — редирект на `/`, пользователь залогинен

- [ ] **Step 3: Commit**

```bash
git add src/pages/Register.jsx
git commit -m "feat: add Register page"
```

---

## Task 10: Каталог товаров

**Files:**
- Modify: `src/pages/Catalog.jsx`

- [ ] **Step 1: Реализовать Catalog.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, SlidersHorizontal, X, ShoppingCart } from 'lucide-react'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import { getManufacturers } from '../api/manufacturers'
import { getBrands, getModels, getCars } from '../api/cars'
import { useCart } from '../contexts/CartContext'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [cars, setCars] = useState([])
  const [filters, setFilters] = useState({ category_id: '', manufacturer_id: '', car_id: '' })
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    Promise.all([getCategories(), getManufacturers(), getBrands()])
      .then(([c, m, b]) => {
        setCategories(c.data)
        setManufacturers(m.data)
        setBrands(b.data)
      })
  }, [])

  useEffect(() => {
    if (selectedBrand) getModels(selectedBrand).then(r => setModels(r.data))
    else { setModels([]); setSelectedModel(''); setCars([]) }
  }, [selectedBrand])

  useEffect(() => {
    if (selectedModel) getCars(selectedModel).then(r => setCars(r.data))
    else { setCars([]); setFilters(f => ({ ...f, car_id: '' })) }
  }, [selectedModel])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.manufacturer_id) params.manufacturer_id = filters.manufacturer_id
    if (filters.car_id) params.car_id = filters.car_id
    getProducts(params)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }, [filters])

  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }))
  const clearFilters = () => {
    setFilters({ category_id: '', manufacturer_id: '', car_id: '' })
    setSelectedBrand(''); setSelectedModel('')
  }
  const hasFilters = Object.values(filters).some(Boolean)

  const selectClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Каталог</h1>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Фильтры
          {hasFilters && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select value={filters.category_id} onChange={setFilter('category_id')} className={selectClass}>
            <option value="">Все категории</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <select value={filters.manufacturer_id} onChange={setFilter('manufacturer_id')} className={selectClass}>
            <option value="">Все производители</option>
            {manufacturers.map(m => <option key={m.manufacturer_id} value={m.manufacturer_id}>{m.manufacturer_name}</option>)}
          </select>
          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className={selectClass}>
            <option value="">Марка авто</option>
            {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
          </select>
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand} className={selectClass}>
            <option value="">Модель авто</option>
            {models.map(m => <option key={m.model_id} value={m.model_id}>{m.model_name}</option>)}
          </select>
          <select value={filters.car_id} onChange={setFilter('car_id')} disabled={!selectedModel} className={selectClass}>
            <option value="">Год / поколение</option>
            {cars.map(c => <option key={c.car_id} value={c.car_id}>{c.year_start}–{c.year_end ?? '...'} {c.generation ?? ''}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 sm:col-span-2 lg:col-span-5 transition-colors">
              <X size={14} /> Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="w-full h-40 bg-gray-800 rounded-xl mb-4" />
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.product_id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col">
              <Link to={`/product/${p.product_id}`}>
                <div className="w-full h-40 bg-gray-800 rounded-xl mb-4 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover rounded-xl" />
                    : <Package size={36} className="text-gray-600" />
                  }
                </div>
                <div className="text-xs text-orange-500 font-medium mb-1">{p.category.category_name}</div>
                <div className="text-sm font-semibold text-white mb-1 leading-snug">{p.product_name}</div>
                <div className="text-xs text-gray-500 font-mono mb-3">{p.sku}</div>
              </Link>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-bold text-white">{Number(p.price).toLocaleString('ru')} ₽</span>
                <button
                  onClick={() => addToCart({ product_id: p.product_id, product_name: p.product_name, price: p.price, image_url: p.image_url })}
                  className="p-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Проверить в браузере**

1. Открыть `http://localhost:5173/catalog`
2. Убедиться что товары загружаются из API
3. Открыть «Фильтры», выбрать категорию — список товаров обновляется
4. Кнопка «В корзину» — счётчик в хедере увеличивается

- [ ] **Step 3: Commit**

```bash
git add src/pages/Catalog.jsx
git commit -m "feat: add Catalog page with filters"
```

---

## Task 11: Карточка товара

**Files:**
- Modify: `src/pages/Product.jsx`

- [ ] **Step 1: Реализовать Product.jsx**

```jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, ShoppingCart, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { getProduct, deleteProduct } from '../api/products'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { isAdmin } = useAuth()

  useEffect(() => {
    getProduct(id).then(r => setProduct(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-64 bg-gray-800 rounded-2xl" /></div>
  if (!product) return <div className="p-8 text-center text-gray-400">Товар не найден</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Назад в каталог
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="w-full aspect-square bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center">
          {product.image_url
            ? <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover rounded-2xl" />
            : <Package size={80} className="text-gray-600" />
          }
        </div>

        <div className="flex flex-col">
          <div className="text-sm text-orange-500 font-medium mb-2">{product.category.category_name}</div>
          <h1 className="text-2xl font-bold text-white mb-2">{product.product_name}</h1>
          <div className="text-sm text-gray-500 font-mono mb-4">{product.sku}</div>
          <div className="text-sm text-gray-400 mb-4">{product.manufacturer.manufacturer_name}</div>

          {product.description && (
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="text-3xl font-bold text-white mb-2">
            {Number(product.price).toLocaleString('ru')} ₽
          </div>
          <div className={`text-sm mb-6 ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {product.stock_quantity > 0 ? `В наличии: ${product.stock_quantity} шт.` : 'Нет в наличии'}
          </div>

          <button
            onClick={() => addToCart({ product_id: product.product_id, product_name: product.product_name, price: product.price, image_url: product.image_url })}
            disabled={product.stock_quantity === 0}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            <ShoppingCart size={18} />
            Добавить в корзину
          </button>

          {isAdmin && (
            <div className="flex gap-3 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-400 py-2.5 rounded-xl text-sm transition-colors">
                <Pencil size={15} /> Редактировать
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-red-400 py-2.5 rounded-xl text-sm transition-colors">
                <Trash2 size={15} /> Удалить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Проверить в браузере**

1. Из каталога кликнуть на товар — открывается `/product/:id`
2. Отображается название, цена, SKU, категория, производитель
3. Кнопка «Добавить в корзину» работает — счётчик растёт
4. Под «В корзину» нет кнопок Редактировать/Удалить — войти как admin, убедиться что появляются

- [ ] **Step 3: Commit**

```bash
git add src/pages/Product.jsx
git commit -m "feat: add Product detail page with admin controls"
```

---

## Task 12: Корзина и оформление заказа

**Files:**
- Modify: `src/pages/Cart.jsx`
- Modify: `src/pages/Checkout.jsx`

- [ ] **Step 1: Реализовать Cart.jsx**

```jsx
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

export default function Cart() {
  const { items, removeFromCart, updateQty, totalPrice } = useCart()

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingCart size={56} className="mx-auto mb-4 text-gray-600" />
      <h2 className="text-xl font-bold text-white mb-2">Корзина пуста</h2>
      <p className="text-gray-400 mb-6">Добавьте товары из каталога</p>
      <Link to="/catalog" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Перейти в каталог <ArrowRight size={16} />
      </Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Корзина</h1>
      <div className="flex flex-col gap-3 mb-6">
        {items.map(item => (
          <div key={item.product_id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
              {item.image_url
                ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover rounded-xl" />
                : <ShoppingCart size={20} className="text-gray-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product_id}`} className="text-sm font-semibold text-white hover:text-orange-400 line-clamp-1 transition-colors">
                {item.product_name}
              </Link>
              <div className="text-sm text-orange-500 font-semibold mt-0.5">
                {Number(item.price).toLocaleString('ru')} ₽
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Minus size={14} className="text-gray-300" />
              </button>
              <span className="w-8 text-center text-white font-semibold text-sm">{item.quantity}</span>
              <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Plus size={14} className="text-gray-300" />
              </button>
            </div>
            <div className="text-right min-w-[80px]">
              <div className="text-sm font-bold text-white">{(Number(item.price) * item.quantity).toLocaleString('ru')} ₽</div>
            </div>
            <button onClick={() => removeFromCart(item.product_id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-gray-400 text-sm">Итого</div>
          <div className="text-2xl font-bold text-white">{totalPrice.toLocaleString('ru')} ₽</div>
        </div>
        <Link to="/checkout" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors">
          Оформить заказ <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Реализовать Checkout.jsx**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { createOrder } from '../api/orders'
import { useCart } from '../contexts/CartContext'

const PAYMENT_METHODS = ['Картой онлайн', 'Наличными при получении', 'Банковский перевод']

export default function Checkout() {
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState(PAYMENT_METHODS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { items, clearCart, totalPrice } = useCart()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const order = await createOrder({
        delivery_address: address,
        payment_method: payment,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      })
      clearCart()
      navigate(`/orders/${order.data.order_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка оформления заказа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Оформление заказа</h1>
      <div className="grid gap-4">
        {/* Состав заказа */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">Товары</h2>
          {items.map(i => (
            <div key={i.product_id} className="flex justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
              <span className="text-gray-300">{i.product_name} × {i.quantity}</span>
              <span className="text-white font-medium">{(Number(i.price) * i.quantity).toLocaleString('ru')} ₽</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-white pt-3 mt-1">
            <span>Итого</span>
            <span>{totalPrice.toLocaleString('ru')} ₽</span>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Адрес доставки</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
              placeholder="Город, улица, дом, квартира"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Способ оплаты</label>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" value={m} checked={payment === m} onChange={() => setPayment(m)} className="accent-orange-500" />
                  <span className="text-sm text-gray-200">{m}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            <CheckCircle size={18} />
            {loading ? 'Оформляем...' : 'Подтвердить заказ'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Проверить в браузере**

1. Добавить товар в корзину → открыть `/cart`
2. Нажать «Оформить заказ» → `/checkout`
3. Заполнить адрес, выбрать оплату, нажать «Подтвердить заказ»
4. После успеха — редирект на страницу заказа, корзина очищается

- [ ] **Step 4: Commit**

```bash
git add src/pages/Cart.jsx src/pages/Checkout.jsx
git commit -m "feat: add Cart and Checkout pages"
```

---

## Task 13: Мои заказы и профиль

**Files:**
- Modify: `src/pages/Orders.jsx`
- Modify: `src/pages/OrderDetail.jsx`
- Modify: `src/pages/Profile.jsx`

- [ ] **Step 1: Реализовать Orders.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { getMyOrders } from '../api/orders'

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-400 bg-purple-400/10',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 text-gray-400">Загрузка...</div>

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Package size={56} className="mx-auto mb-4 text-gray-600" />
      <h2 className="text-xl font-bold text-white mb-2">Заказов пока нет</h2>
      <Link to="/catalog" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors mt-2">
        Перейти в каталог
      </Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Мои заказы</h1>
      <div className="flex flex-col gap-3">
        {orders.map(o => (
          <Link
            key={o.order_id}
            to={`/orders/${o.order_id}`}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex items-center justify-between transition-all"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-white font-semibold">Заказ #{o.order_id}</span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[o.status.status_name] || 'text-gray-400 bg-gray-800'}`}>
                  {o.status.status_name}
                </span>
              </div>
              <div className="text-sm text-gray-400">{new Date(o.created_at).toLocaleDateString('ru')} · {o.items.length} товар(ов) · {Number(o.total_amount).toLocaleString('ru')} ₽</div>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Реализовать OrderDetail.jsx**

```jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getOrder } from '../api/orders'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STATUS_LABELS = { pending: 'Ожидает', confirmed: 'Подтверждён', processing: 'В обработке', shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён' }

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id).then(r => setOrder(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 text-gray-400">Загрузка...</div>
  if (!order) return <div className="p-8 text-center text-gray-400">Заказ не найден</div>

  const currentStep = STATUS_STEPS.indexOf(order.status.status_name)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Мои заказы
      </Link>
      <h1 className="text-2xl font-bold text-white mb-1">Заказ #{order.order_id}</h1>
      <p className="text-sm text-gray-400 mb-6">{new Date(order.created_at).toLocaleString('ru')}</p>

      {order.status.status_name !== 'cancelled' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= currentStep ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] text-center ${i <= currentStep ? 'text-orange-400' : 'text-gray-600'}`}>{STATUS_LABELS[s]}</span>
                {i < STATUS_STEPS.length - 1 && <div className={`absolute h-0.5 w-full hidden`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
        <h2 className="font-semibold text-white mb-3">Товары</h2>
        {order.items.map(item => (
          <div key={item.item_id} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
            <span className="text-gray-300">#{item.product_id} × {item.quantity}</span>
            <span className="text-white">{(Number(item.price_at_purchase) * item.quantity).toLocaleString('ru')} ₽</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-white pt-3">
          <span>Итого</span>
          <span>{Number(order.total_amount).toLocaleString('ru')} ₽</span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-sm text-gray-300 flex flex-col gap-2">
        <div><span className="text-gray-500">Адрес:</span> {order.delivery_address}</div>
        <div><span className="text-gray-500">Оплата:</span> {order.payment_method}</div>
        <div><span className="text-gray-500">Статус оплаты:</span> {order.payment_status}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Реализовать Profile.jsx**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Package } from 'lucide-react'
import { updateMe } from '../api/users'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, login } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateMe(form)
      setEditing(false)
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Профиль</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
            <User size={24} className="text-orange-400" />
          </div>
          <div>
            <div className="font-bold text-white text-lg">{user?.username}</div>
            <div className="text-sm text-gray-400">{user?.role?.role_name}</div>
          </div>
        </div>

        {!editing ? (
          <div className="flex flex-col gap-2 text-sm">
            <div><span className="text-gray-500">Email:</span> <span className="text-gray-200 ml-2">{user?.email}</span></div>
            <div><span className="text-gray-500">Телефон:</span> <span className="text-gray-200 ml-2">{user?.phone || '—'}</span></div>
            <div><span className="text-gray-500">Аккаунт с:</span> <span className="text-gray-200 ml-2">{new Date(user?.created_at).toLocaleDateString('ru')}</span></div>
            <button onClick={() => setEditing(true)} className="mt-3 text-orange-400 hover:text-orange-300 text-sm transition-colors self-start">
              Редактировать
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Имя пользователя</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Телефон</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2 mt-1">
              <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-gray-700 hover:border-gray-600 text-gray-300 py-2.5 rounded-xl text-sm transition-colors">
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      <Link to="/orders" className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-all">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-orange-400" />
          <span className="text-white font-medium">Мои заказы</span>
        </div>
        <span className="text-gray-500 text-sm">→</span>
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Проверить в браузере**

1. Открыть `/orders` — список заказов с цветными статусами
2. Кликнуть на заказ → детальная страница с прогрессом статусов
3. Открыть `/profile` — данные пользователя, кнопка «Редактировать»

- [ ] **Step 5: Commit**

```bash
git add src/pages/Orders.jsx src/pages/OrderDetail.jsx src/pages/Profile.jsx
git commit -m "feat: add Orders, OrderDetail and Profile pages"
```

---

## Task 14: Admin Layout + Dashboard

**Files:**
- Modify: `src/pages/admin/AdminLayout.jsx`
- Modify: `src/pages/admin/Dashboard.jsx`

- [ ] **Step 1: Реализовать AdminLayout.jsx**

```jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Wrench, LayoutDashboard, Package, ShoppingBag, Users, Tag, Factory, Car, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Товары', icon: Package },
  { to: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/categories', label: 'Категории', icon: Tag },
  { to: '/admin/manufacturers', label: 'Производители', icon: Factory },
  { to: '/admin/cars', label: 'Автомобили', icon: Car },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-gray-800">
          <div className="flex items-center gap-2 text-orange-500 font-bold">
            <Wrench size={18} />
            <span className="text-sm">TuningShop</span>
            <span className="text-xs text-gray-500 font-normal ml-1">admin</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-orange-500/10 text-orange-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors">
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Реализовать Dashboard.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { getProducts } from '../../api/products'
import { getAllOrders } from '../../api/orders'
import { getAllUsers } from '../../api/users'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    Promise.all([getProducts({}), getAllOrders(), getAllUsers()]).then(([p, o, u]) => {
      const orders = o.data
      setStats({
        products: p.data.length,
        orders: orders.length,
        users: u.data.length,
        revenue: orders.reduce((s, o) => s + Number(o.total_amount), 0),
      })
      setRecentOrders(orders.slice(-5).reverse())
    })
  }, [])

  const STATUS_COLORS = { pending: 'text-yellow-400', confirmed: 'text-blue-400', processing: 'text-purple-400', shipped: 'text-cyan-400', delivered: 'text-green-400', cancelled: 'text-red-400' }

  const cards = [
    { label: 'Товаров', value: stats.products, icon: Package, link: '/admin/products' },
    { label: 'Заказов', value: stats.orders, icon: ShoppingBag, link: '/admin/orders' },
    { label: 'Пользователей', value: stats.users, icon: Users, link: '/admin/users' },
    { label: 'Выручка', value: `${stats.revenue.toLocaleString('ru')} ₽`, icon: TrendingUp, link: '/admin/orders' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, link }) => (
          <Link key={label} to={link} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{label}</span>
              <Icon size={18} className="text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">Последние заказы</h2>
        <div className="flex flex-col gap-2">
          {recentOrders.map(o => (
            <div key={o.order_id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0 text-sm">
              <span className="text-gray-300">Заказ #{o.order_id}</span>
              <span className={STATUS_COLORS[o.status.status_name]}>{o.status.status_name}</span>
              <span className="text-white font-medium">{Number(o.total_amount).toLocaleString('ru')} ₽</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Проверить в браузере**

1. Войти как admin → в хедере появляется «Админпанель»
2. Открыть `http://localhost:5173/admin` — sidebar слева, карточки со статистикой
3. Клик по пунктам sidebar — навигация работает

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminLayout.jsx src/pages/admin/Dashboard.jsx
git commit -m "feat: add admin layout with sidebar and dashboard"
```

---

## Task 15: Админ — Управление товарами

**Files:**
- Modify: `src/pages/admin/Products.jsx`

- [ ] **Step 1: Реализовать admin/Products.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import { getCategories } from '../../api/categories'
import { getManufacturers } from '../../api/manufacturers'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ category_id: '', manufacturer_id: '', product_name: '', description: '', price: '', stock_quantity: 0 })
  const [saving, setSaving] = useState(false)

  const load = () => getProducts({}).then(r => setProducts(r.data))

  useEffect(() => {
    load()
    getCategories().then(r => setCategories(r.data))
    getManufacturers().then(r => setManufacturers(r.data))
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await updateProduct(editId, { product_name: form.product_name, description: form.description, price: form.price, stock_quantity: Number(form.stock_quantity) })
      else await createProduct({ ...form, category_id: Number(form.category_id), manufacturer_id: Number(form.manufacturer_id), price: form.price, stock_quantity: Number(form.stock_quantity) })
      await load()
      setShowForm(false)
      setEditId(null)
      setForm({ category_id: '', manufacturer_id: '', product_name: '', description: '', price: '', stock_quantity: 0 })
    } finally { setSaving(false) }
  }

  const handleEdit = (p) => {
    setEditId(p.product_id)
    setForm({ category_id: p.category.category_id, manufacturer_id: p.manufacturer.manufacturer_id, product_name: p.product_name, description: p.description || '', price: p.price, stock_quantity: p.stock_quantity })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return
    await deleteProduct(id)
    await load()
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
  const selectClass = inputClass

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Товары</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ category_id: '', manufacturer_id: '', product_name: '', description: '', price: '', stock_quantity: 0 }) }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Название</label>
            <input value={form.product_name} onChange={set('product_name')} required className={inputClass} placeholder="Название товара" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Категория</label>
            <select value={form.category_id} onChange={set('category_id')} required className={selectClass}>
              <option value="">Выберите...</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Производитель</label>
            <select value={form.manufacturer_id} onChange={set('manufacturer_id')} required className={selectClass}>
              <option value="">Выберите...</option>
              {manufacturers.map(m => <option key={m.manufacturer_id} value={m.manufacturer_id}>{m.manufacturer_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Цена (₽)</label>
            <input type="number" step="0.01" value={form.price} onChange={set('price')} required className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Остаток (шт.)</label>
            <input type="number" value={form.stock_quantity} onChange={set('stock_quantity')} required className={inputClass} placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Описание</label>
            <textarea value={form.description} onChange={set('description')} rows={2} className={`${inputClass} resize-none`} placeholder="Необязательно" />
          </div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Check size={15} /> {saving ? 'Сохранение...' : editId ? 'Сохранить' : 'Создать'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="flex items-center gap-1.5 border border-gray-700 hover:border-gray-600 text-gray-300 text-sm px-4 py-2.5 rounded-xl transition-colors">
              <X size={15} /> Отмена
            </button>
          </div>
        </form>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Остаток</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.product_id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-white font-medium">{p.product_name}</div>
                  <div className="text-xs text-gray-500 font-mono">{p.sku}</div>
                </td>
                <td className="px-4 py-3 text-gray-300">{p.category.category_name}</td>
                <td className="px-4 py-3 text-white">{Number(p.price).toLocaleString('ru')} ₽</td>
                <td className="px-4 py-3">
                  <span className={p.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}>{p.stock_quantity}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-orange-400 transition-colors rounded-lg hover:bg-gray-800">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.product_id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Проверить в браузере**

1. Открыть `/admin/products` — таблица товаров
2. Нажать «Добавить» → появляется форма → заполнить → «Создать» → товар появляется в таблице
3. Кнопка карандаша — форма заполняется данными товара → «Сохранить»
4. Кнопка корзины → подтверждение → товар удаляется

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Products.jsx
git commit -m "feat: add admin products management"
```

---

## Task 16: Админ — Заказы и Пользователи

**Files:**
- Modify: `src/pages/admin/Orders.jsx`
- Modify: `src/pages/admin/Users.jsx`

- [ ] **Step 1: Реализовать admin/Orders.jsx**

```jsx
import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '../../api/orders'
import { getRoles } from '../../api/users'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = { pending: 'text-yellow-400', confirmed: 'text-blue-400', processing: 'text-purple-400', shipped: 'text-cyan-400', delivered: 'text-green-400', cancelled: 'text-red-400' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [statuses, setStatuses] = useState([])

  const load = () => getAllOrders().then(r => setOrders(r.data))

  useEffect(() => {
    load()
    import('../../api/users').then(m => {})
    // Берём статусы из первого заказа или хардкодим — API не имеет GET /statuses
  }, [])

  const handleStatus = async (orderId, statusName) => {
    // Находим status_id по имени из текущих заказов
    const order = orders.find(o => o.order_id === orderId)
    const currentStatusId = order.status.status_id
    const offset = STATUSES.indexOf(statusName) - STATUSES.indexOf(order.status.status_name)
    const newStatusId = currentStatusId + offset
    await updateOrderStatus(orderId, newStatusId)
    await load()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Заказы</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.order_id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 text-gray-300">#{o.order_id}</td>
                <td className="px-4 py-3 text-gray-300">user #{o.user_id}</td>
                <td className="px-4 py-3 text-white font-medium">{Number(o.total_amount).toLocaleString('ru')} ₽</td>
                <td className="px-4 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString('ru')}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status.status_name}
                    onChange={e => handleStatus(o.order_id, e.target.value)}
                    className={`bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs focus:outline-none ${STATUS_COLORS[o.status.status_name]}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Реализовать admin/Users.jsx**

```jsx
import { useState, useEffect } from 'react'
import { getAllUsers, updateRole } from '../../api/users'
import client from '../../api/client'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])

  const load = () => getAllUsers().then(r => setUsers(r.data))

  useEffect(() => {
    load()
    client.get('/roles/').then(r => setRoles(r.data))
  }, [])

  const handleRole = async (userId, roleId) => {
    await updateRole(userId, Number(roleId))
    await load()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Пользователи</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Роль</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString('ru')}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role.role_id}
                    onChange={e => handleRole(u.user_id, e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Проверить в браузере**

1. `/admin/orders` — таблица заказов, dropdown статуса меняет статус через API
2. `/admin/users` — таблица пользователей, dropdown роли меняет роль

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/Orders.jsx src/pages/admin/Users.jsx
git commit -m "feat: add admin orders and users management"
```

---

## Task 17: Админ — Справочники (Категории, Производители, Авто)

**Files:**
- Modify: `src/pages/admin/Categories.jsx`
- Modify: `src/pages/admin/Manufacturers.jsx`
- Modify: `src/pages/admin/Cars.jsx`

- [ ] **Step 1: Реализовать admin/Categories.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getCategories, createCategory, deleteCategory } from '../../api/categories'

export default function AdminCategories() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => getCategories().then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try { await createCategory(name.trim()); setName(''); await load() }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить категорию?')) return
    await deleteCategory(id); await load()
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Категории</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Название категории"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" />
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={15} /> Добавить
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map(c => (
          <div key={c.category_id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-gray-200 text-sm">{c.category_name}</span>
            <button onClick={() => handleDelete(c.category_id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Реализовать admin/Manufacturers.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getManufacturers, createManufacturer, deleteManufacturer } from '../../api/manufacturers'

export default function AdminManufacturers() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => getManufacturers().then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try { await createManufacturer(name.trim()); setName(''); await load() }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить производителя?')) return
    await deleteManufacturer(id); await load()
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Производители</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Название производителя"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" />
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={15} /> Добавить
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map(m => (
          <div key={m.manufacturer_id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <span className="text-gray-200 text-sm">{m.manufacturer_name}</span>
            <button onClick={() => handleDelete(m.manufacturer_id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Реализовать admin/Cars.jsx**

```jsx
import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { getBrands, createBrand, getModels, createModel, getCars, createCar, deleteCar } from '../../api/cars'

export default function AdminCars() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [cars, setCars] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [brandName, setBrandName] = useState('')
  const [modelName, setModelName] = useState('')
  const [carForm, setCarForm] = useState({ year_start: '', year_end: '', generation: '' })

  const loadBrands = () => getBrands().then(r => setBrands(r.data))
  const loadModels = (bid) => getModels(bid).then(r => setModels(r.data))
  const loadCars = (mid) => getCars(mid).then(r => setCars(r.data))

  useEffect(() => { loadBrands() }, [])
  useEffect(() => { if (selectedBrand) loadModels(selectedBrand); else { setModels([]); setSelectedModel(''); setCars([]) } }, [selectedBrand])
  useEffect(() => { if (selectedModel) loadCars(selectedModel); else setCars([]) }, [selectedModel])

  const addBrand = async (e) => { e.preventDefault(); await createBrand(brandName.trim()); setBrandName(''); await loadBrands() }
  const addModel = async (e) => { e.preventDefault(); await createModel({ brand_id: Number(selectedBrand), model_name: modelName.trim() }); setModelName(''); await loadModels(selectedBrand) }
  const addCar = async (e) => {
    e.preventDefault()
    await createCar({ model_id: Number(selectedModel), year_start: Number(carForm.year_start), year_end: carForm.year_end ? Number(carForm.year_end) : null, generation: carForm.generation || null })
    setCarForm({ year_start: '', year_end: '', generation: '' })
    await loadCars(selectedModel)
  }
  const removeCar = async (id) => { if (!confirm('Удалить?')) return; await deleteCar(id); await loadCars(selectedModel) }

  const inputClass = "flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
  const selectClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Автомобили</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Бренды */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Бренды</h2>
          <form onSubmit={addBrand} className="flex gap-2 mb-3">
            <input value={brandName} onChange={e => setBrandName(e.target.value)} required placeholder="Toyota" className={inputClass} />
            <button type="submit" className="p-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl transition-colors"><Plus size={15} /></button>
          </form>
          <div className="flex flex-col gap-1">
            {brands.map(b => (
              <button key={b.brand_id} onClick={() => { setSelectedBrand(b.brand_id); setSelectedModel('') }}
                className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${Number(selectedBrand) === b.brand_id ? 'bg-orange-500/10 text-orange-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                {b.brand_name}
              </button>
            ))}
          </div>
        </div>

        {/* Модели */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Модели {selectedBrand ? '' : <span className="text-gray-600 text-xs font-normal">← выберите бренд</span>}</h2>
          {selectedBrand && (
            <form onSubmit={addModel} className="flex gap-2 mb-3">
              <input value={modelName} onChange={e => setModelName(e.target.value)} required placeholder="Camry" className={inputClass} />
              <button type="submit" className="p-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl transition-colors"><Plus size={15} /></button>
            </form>
          )}
          <div className="flex flex-col gap-1">
            {models.map(m => (
              <button key={m.model_id} onClick={() => setSelectedModel(m.model_id)}
                className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${Number(selectedModel) === m.model_id ? 'bg-orange-500/10 text-orange-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                {m.model_name}
              </button>
            ))}
          </div>
        </div>

        {/* Поколения/годы */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Поколения {selectedModel ? '' : <span className="text-gray-600 text-xs font-normal">← выберите модель</span>}</h2>
          {selectedModel && (
            <form onSubmit={addCar} className="flex flex-col gap-2 mb-3">
              <input value={carForm.year_start} onChange={e => setCarForm(f => ({ ...f, year_start: e.target.value }))} required type="number" placeholder="Год начала" className={inputClass + ' flex-none'} />
              <input value={carForm.year_end} onChange={e => setCarForm(f => ({ ...f, year_end: e.target.value }))} type="number" placeholder="Год конца (необяз.)" className={inputClass + ' flex-none'} />
              <input value={carForm.generation} onChange={e => setCarForm(f => ({ ...f, generation: e.target.value }))} placeholder="Поколение (необяз.)" className={inputClass + ' flex-none'} />
              <button type="submit" className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                <Plus size={14} /> Добавить
              </button>
            </form>
          )}
          <div className="flex flex-col gap-1">
            {cars.map(c => (
              <div key={c.car_id} className="flex items-center justify-between px-3 py-2 text-sm text-gray-300">
                <span>{c.year_start}–{c.year_end ?? '...'} {c.generation ?? ''}</span>
                <button onClick={() => removeCar(c.car_id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Проверить в браузере**

1. `/admin/categories` — добавить и удалить категорию
2. `/admin/manufacturers` — добавить и удалить производителя
3. `/admin/cars` — выбрать бренд → появляются модели → выбрать модель → добавить поколение

- [ ] **Step 5: Финальный commit**

```bash
git add src/pages/admin/
git commit -m "feat: add admin categories, manufacturers and cars management"
```

---

## Финальная проверка

- [ ] Зайти как обычный пользователь: `/catalog`, `/product/:id`, добавить в корзину, оформить заказ, проверить `/orders`
- [ ] Зайти как admin: проверить все разделы `/admin/*`, добавить товар, поменять статус заказа
- [ ] Попробовать открыть `/admin` без авторизации — редирект на `/login`
- [ ] Попробовать открыть `/checkout` без авторизации — редирект на `/login`

```bash
git log --oneline
```
