import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  Wrench, Car, ChevronLeft, LogOut, Settings, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Товары', icon: Package },
  { to: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/categories', label: 'Категории', icon: Tag },
  { to: '/admin/manufacturers', label: 'Производители', icon: Settings },
  { to: '/admin/cars', label: 'Автомобили', icon: Car },
  { to: '/admin/services', label: 'Заявки на услуги', icon: ClipboardList },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0 h-screen">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-800">
          <Wrench size={18} className="text-orange-500" />
          <span className="font-bold text-white text-sm">TuningShop</span>
          <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded ml-auto">admin</span>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-3 border-t border-gray-800 pt-3 flex flex-col gap-0.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={16} />
            На сайт
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors text-left"
          >
            <LogOut size={16} />
            Выйти
          </button>
          {user && (
            <p className="px-3 pt-2 text-[11px] text-gray-600 truncate">{user.username}</p>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
