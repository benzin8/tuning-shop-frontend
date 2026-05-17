import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Package } from 'lucide-react'
import { createOrder } from '../api/orders'
import { useCart } from '../contexts/CartContext'

const PAYMENT_OPTIONS = [
  { value: 'card', label: 'Банковская карта' },
  { value: 'cash', label: 'Наличными при получении' },
  { value: 'online', label: 'Онлайн (СБП)' },
]

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ delivery_address: '', payment_method: 'card' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.delivery_address.trim()) { setError('Укажите адрес доставки'); return }
    setError('')
    setLoading(true)
    try {
      const res = await createOrder({
        delivery_address: form.delivery_address,
        payment_method: form.payment_method,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      })
      clearCart()
      navigate(`/orders/${res.data.order_id}`, { state: { success: true } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при оформлении заказа')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-400 text-sm">
        Корзина пуста.{' '}
        <Link to="/catalog" className="text-orange-400 hover:text-orange-300">В каталог</Link>
      </p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
        <ArrowLeft size={15} /> Корзина
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">Оформление заказа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Доставка</h2>
            <label className="block text-sm text-gray-400 mb-1.5">Адрес доставки</label>
            <textarea
              value={form.delivery_address}
              onChange={set('delivery_address')}
              rows={3}
              required
              placeholder="Город, улица, дом, квартира"
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Способ оплаты</h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    form.payment_method === opt.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.value}
                    checked={form.payment_method === opt.value}
                    onChange={set('payment_method')}
                    className="accent-orange-500"
                  />
                  <span className="text-sm text-white">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            <CheckCircle2 size={17} />
            {loading ? 'Оформляем...' : 'Разместить заказ'}
          </button>
        </form>

        {/* Order summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-base font-semibold text-white mb-4">Ваш заказ</h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map(item => (
              <div key={item.product_id} className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    : <Package size={14} className="text-gray-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 line-clamp-2">{item.product_name}</p>
                  <p className="text-xs text-gray-500">{item.quantity} шт.</p>
                </div>
                <span className="text-sm font-semibold text-white shrink-0">
                  {(Number(item.price) * item.quantity).toLocaleString('ru')} ₽
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-4">
            <div className="flex justify-between font-bold text-white">
              <span>Итого</span>
              <span>{totalPrice.toLocaleString('ru')} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
