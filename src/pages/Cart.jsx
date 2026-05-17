import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function Cart() {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <ShoppingCart size={56} className="mx-auto mb-4 text-gray-700" />
      <p className="text-white font-semibold text-lg mb-2">Корзина пуста</p>
      <p className="text-gray-500 text-sm mb-6">Добавьте товары из каталога</p>
      <Link to="/catalog" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        В каталог
      </Link>
    </div>
  )

  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Корзина{' '}
          <span className="text-gray-500 text-base font-normal">{items.length} {items.length === 1 ? 'позиция' : 'позиции'}</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-400 transition-colors">
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map(item => (
            <div key={item.product_id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4">
              <Link to={`/product/${item.product_id}`} className="shrink-0">
                <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    : <Package size={24} className="text-gray-600" />
                  }
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.product_id}`}
                  className="text-sm font-semibold text-white hover:text-orange-400 transition-colors line-clamp-2"
                >
                  {item.product_name}
                </Link>
                <p className="text-base font-bold text-white mt-2">
                  {(Number(item.price) * item.quantity).toLocaleString('ru')} ₽
                </p>
                <p className="text-xs text-gray-500">{Number(item.price).toLocaleString('ru')} ₽ / шт.</p>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
                <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => updateQty(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-semibold text-white w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-base font-semibold text-white mb-4">Итого</h2>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Товары ({totalQty} шт.)</span>
            <span>{totalPrice.toLocaleString('ru')} ₽</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>Доставка</span>
            <span className="text-green-400">Уточняется</span>
          </div>
          <div className="border-t border-gray-800 pt-4 mb-5">
            <div className="flex justify-between font-bold text-white text-lg">
              <span>К оплате</span>
              <span>{totalPrice.toLocaleString('ru')} ₽</span>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Оформить заказ <ArrowRight size={16} />
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">Войдите, чтобы оформить заказ</p>
              <Link
                to="/login"
                className="w-full block text-center bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Войти
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
