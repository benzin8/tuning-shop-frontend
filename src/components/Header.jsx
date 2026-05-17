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
          <Link to="/services" className="hover:text-white transition-colors">Услуги</Link>
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
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
                Войти
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded-lg transition-colors">
                Регистрация
              </Link>
            </div>
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
          <Link to="/services" onClick={() => setMobileOpen(false)} className="hover:text-white">Услуги</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="hover:text-white">
            Корзина {totalItems > 0 && `(${totalItems})`}
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-orange-400">Админпанель</Link>
          )}
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
