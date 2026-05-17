import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Users, ClipboardList, ArrowRight, Clock } from 'lucide-react'
import { getProducts } from '../../api/products'
import { getAllOrders } from '../../api/orders'
import { getAllUsers } from '../../api/users'
import { getAllServiceRequests } from '../../api/services'

const STATUS_STYLES = {
  pending:    { label: 'Ожидает',     cls: 'bg-gray-700 text-gray-300' },
  confirmed:  { label: 'Подтверждён', cls: 'bg-blue-500/20 text-blue-400' },
  processing: { label: 'В обработке', cls: 'bg-yellow-500/20 text-yellow-400' },
  shipped:    { label: 'Отправлен',   cls: 'bg-purple-500/20 text-purple-400' },
  delivered:  { label: 'Доставлен',   cls: 'bg-green-500/20 text-green-400' },
  cancelled:  { label: 'Отменён',     cls: 'bg-red-500/20 text-red-400' },
}

function StatCard({ icon: Icon, label, value, to, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-500/10 text-orange-400',
    blue:   'bg-blue-500/10 text-blue-400',
    green:  'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }
  return (
    <Link to={to} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-700 transition-colors group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
        <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      </div>
      <ArrowRight size={15} className="text-gray-600 group-hover:text-orange-400 transition-colors" />
    </Link>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ products: null, orders: null, users: null, requests: null })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProducts(), getAllOrders(), getAllUsers(), getAllServiceRequests()])
      .then(([p, o, u, r]) => {
        setStats({ products: p.data.length, orders: o.data.length, users: u.data.length, requests: r.data.length })
        setRecentOrders(o.data.slice().reverse().slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-bold text-white mb-6">Дашборд</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package}       label="Товаров"          value={stats.products} to="/admin/products" color="orange" />
        <StatCard icon={ShoppingBag}   label="Заказов"          value={stats.orders}   to="/admin/orders"   color="blue" />
        <StatCard icon={Users}         label="Пользователей"    value={stats.users}    to="/admin/users"    color="green" />
        <StatCard icon={ClipboardList} label="Заявок на услуги" value={stats.requests} to="/admin/services" color="purple" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Последние заказы</h2>
          <Link to="/admin/orders" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Все →</Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">Заказов пока нет</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left px-5 py-3 font-medium">№</th>
                <th className="text-left px-5 py-3 font-medium">Дата</th>
                <th className="text-left px-5 py-3 font-medium">Сумма</th>
                <th className="text-left px-5 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentOrders.map(order => {
                const s = STATUS_STYLES[order.status.status_name] ?? { label: order.status.status_name, cls: 'bg-gray-700 text-gray-300' }
                return (
                  <tr key={order.order_id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-gray-300 font-mono">#{order.order_id}</td>
                    <td className="px-5 py-3 text-gray-400">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Clock size={11} />
                        {new Date(order.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white font-semibold">{Number(order.total_amount).toLocaleString('ru')} ₽</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
