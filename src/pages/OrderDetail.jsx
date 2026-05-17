import { useState, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle2 } from 'lucide-react'
import { getOrder } from '../api/orders'

const STATUS_STYLES = {
  pending:    { label: 'Ожидает подтверждения', cls: 'bg-gray-700 text-gray-300' },
  confirmed:  { label: 'Подтверждён',           cls: 'bg-blue-500/20 text-blue-400' },
  processing: { label: 'В обработке',           cls: 'bg-yellow-500/20 text-yellow-400' },
  shipped:    { label: 'Отправлен',             cls: 'bg-purple-500/20 text-purple-400' },
  delivered:  { label: 'Доставлен',             cls: 'bg-green-500/20 text-green-400' },
  cancelled:  { label: 'Отменён',               cls: 'bg-red-500/20 text-red-400' },
}

const PAYMENT_LABELS = { card: 'Банковская карта', cash: 'Наличными', online: 'Онлайн (СБП)' }

function StatusBadge({ name }) {
  const s = STATUS_STYLES[name] ?? { label: name, cls: 'bg-gray-700 text-gray-300' }
  return <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${s.cls}`}>{s.label}</span>
}

export default function OrderDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-4 bg-gray-800 rounded w-32 mb-8" />
      <div className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
      <div className="h-40 bg-gray-900 border border-gray-800 rounded-2xl" />
    </div>
  )

  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-400">Заказ не найден</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
        <ArrowLeft size={15} /> Мои заказы
      </Link>

      {state?.success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 mb-6">
          <CheckCircle2 size={20} className="text-green-400 shrink-0" />
          <div>
            <p className="text-green-400 font-semibold text-sm">Заказ успешно оформлен!</p>
            <p className="text-green-500/70 text-xs mt-0.5">Мы свяжемся с вами для подтверждения</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Заказ #{order.order_id}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Clock size={11} />
              {new Date(order.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <StatusBadge name={order.status.status_name} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2.5 text-gray-400">
            <MapPin size={15} className="text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Адрес доставки</p>
              <p className="text-gray-200">{order.delivery_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-gray-400">
            <CreditCard size={15} className="text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Способ оплаты</p>
              <p className="text-gray-200">{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">Товары</h2>
        <div className="flex flex-col divide-y divide-gray-800">
          {order.items.map(item => (
            <div key={item.item_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                <Package size={16} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="text-sm text-gray-200 hover:text-orange-400 transition-colors line-clamp-1">
                  Товар #{item.product_id}
                </Link>
                <p className="text-xs text-gray-500">{item.quantity} шт. × {Number(item.price_at_purchase).toLocaleString('ru')} ₽</p>
              </div>
              <span className="text-sm font-semibold text-white shrink-0">
                {(item.quantity * Number(item.price_at_purchase)).toLocaleString('ru')} ₽
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Итого</span>
          <span className="text-xl font-bold text-white">{Number(order.total_amount).toLocaleString('ru')} ₽</span>
        </div>
      </div>
    </div>
  )
}
