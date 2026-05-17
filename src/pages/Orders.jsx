import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Clock } from 'lucide-react'
import { getMyOrders } from '../api/orders'

const STATUS_STYLES = {
  pending:    { label: 'Ожидает',      cls: 'bg-gray-700 text-gray-300' },
  confirmed:  { label: 'Подтверждён',  cls: 'bg-blue-500/20 text-blue-400' },
  processing: { label: 'В обработке',  cls: 'bg-yellow-500/20 text-yellow-400' },
  shipped:    { label: 'Отправлен',    cls: 'bg-purple-500/20 text-purple-400' },
  delivered:  { label: 'Доставлен',    cls: 'bg-green-500/20 text-green-400' },
  cancelled:  { label: 'Отменён',      cls: 'bg-red-500/20 text-red-400' },
}

function StatusBadge({ name }) {
  const s = STATUS_STYLES[name] ?? { label: name, cls: 'bg-gray-700 text-gray-300' }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data.slice().reverse()))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={52} className="mx-auto mb-4 text-gray-700" />
          <p className="text-white font-semibold mb-2">Заказов пока нет</p>
          <p className="text-gray-500 text-sm mb-6">Перейдите в каталог и оформите первый заказ</p>
          <Link to="/catalog" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <Link
              key={order.order_id}
              to={`/orders/${order.order_id}`}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                <ShoppingBag size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-white">Заказ #{order.order_id}</span>
                  <StatusBadge name={order.status.status_name} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(order.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span>·</span>
                  <span>{order.items.length} {order.items.length === 1 ? 'позиция' : 'позиции'}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold text-white">{Number(order.total_amount).toLocaleString('ru')} ₽</div>
                <ArrowRight size={15} className="text-gray-600 group-hover:text-orange-400 transition-colors ml-auto mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
