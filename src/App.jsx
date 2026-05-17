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
import Services from './pages/Services'
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
import AdminServiceRequests from './pages/admin/ServiceRequests'

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
            <Route path="/services" element={<ClientLayout><Services /></ClientLayout>} />

            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="manufacturers" element={<AdminManufacturers />} />
              <Route path="cars" element={<AdminCars />} />
              <Route path="services" element={<AdminServiceRequests />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
