import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Clock } from 'lucide-react'
import { getAllOrders, getOrderStatuses, updateOrderStatus } from '../../api/orders'

const STATUS_CLS = {
  pending:    'bg-gray-700 text-gray-300',
  confirmed:  'bg-blue-500/20 text-blue-400',
  processing: 'bg-yellow-500/20 text-yellow-400',
  shipped:    'bg-purple-500/20 text-purple-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    Promise.all([getAllOrders(), getOrderStatuses()])
      .then(([o, s]) => {
        setOrders(o.data.slice().reverse())
        setStatuses(s.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (orderId, statusId) => {
    setUpdating(orderId)
    try {
      const res = await updateOrderStatus(orderId, parseInt(statusId))
      setOrders(prev => prev.map(o => o.order_id === orderId ? res.data : o))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Заказы</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Заказов нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left px-5 py-3 font-medium">№</th>
                  <th className="text-left px-5 py-3 font-medium">Дата</th>
                  <th className="text-left px-5 py-3 font-medium">Позиций</th>
                  <th className="text-left px-5 py-3 font-medium">Сумма</th>
                  <th className="text-left px-5 py-3 font-medium">Статус</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map(order => (
                  <tr key={order.order_id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 text-gray-300 font-mono text-xs">#{order.order_id}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(order.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{order.items.length}</td>
                    <td className="px-5 py-3 text-white font-semibold whitespace-nowrap">{Number(order.total_amount).toLocaleString('ru')} ₽</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status.status_id}
                        disabled={updating === order.order_id}
                        onChange={e => handleStatus(order.order_id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_CLS[order.status.status_name] ?? 'bg-gray-700 text-gray-300'}`}
                      >
                        {statuses.map(s => (
                          <option key={s.status_id} value={s.status_id} className="bg-gray-800 text-gray-200">{s.status_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/orders/${order.order_id}`} className="text-gray-500 hover:text-orange-400 transition-colors" target="_blank">
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
