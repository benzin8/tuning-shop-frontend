import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Shield, Calendar, Check, Pencil, X, ShoppingBag, Wrench, Clock, ChevronRight } from 'lucide-react'
import { updateMe } from '../api/users'
import { getMyOrders } from '../api/orders'
import { getMyServiceRequests } from '../api/services'
import { useAuth } from '../contexts/AuthContext'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-0.5">{label}</p>
        <p className="text-sm text-gray-200">{value || <span className="text-gray-600 italic">не указано</span>}</p>
      </div>
    </div>
  )
}

const ORDER_STATUS = {
  pending:    { label: 'Ожидает',     cls: 'bg-gray-700 text-gray-300' },
  confirmed:  { label: 'Подтверждён', cls: 'bg-blue-500/20 text-blue-400' },
  processing: { label: 'В обработке', cls: 'bg-yellow-500/20 text-yellow-400' },
  shipped:    { label: 'Отправлен',   cls: 'bg-purple-500/20 text-purple-400' },
  delivered:  { label: 'Доставлен',   cls: 'bg-green-500/20 text-green-400' },
  cancelled:  { label: 'Отменён',     cls: 'bg-red-500/20 text-red-400' },
}

const SERVICE_STATUS = {
  new:         { label: 'Новая',        cls: 'bg-blue-500/20 text-blue-400' },
  confirmed:   { label: 'Подтверждена', cls: 'bg-orange-500/20 text-orange-400' },
  in_progress: { label: 'В работе',     cls: 'bg-yellow-500/20 text-yellow-400' },
  done:        { label: 'Выполнена',    cls: 'bg-green-500/20 text-green-400' },
  cancelled:   { label: 'Отменена',     cls: 'bg-red-500/20 text-red-400' },
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username ?? '', phone: user?.phone ?? '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [orders, setOrders] = useState([])
  const [serviceRequests, setServiceRequests] = useState([])

  useEffect(() => {
    getMyOrders().then(r => setOrders(r.data.slice().reverse().slice(0, 5)))
    getMyServiceRequests().then(r => setServiceRequests(r.data.slice(0, 5)))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await updateMe({ username: form.username || undefined, phone: form.phone || null })
      if (setUser) setUser(res.data)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({ username: user?.username ?? '', phone: user?.phone ?? '' })
    setError('')
    setEditing(false)
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Профиль</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <User size={24} className="text-orange-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{user.username}</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              user.role?.role_name === 'admin'
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-gray-700 text-gray-400'
            }`}>
              {user.role?.role_name === 'admin' ? 'Администратор' : 'Покупатель'}
            </span>
          </div>
        </div>

        {/* Info */}
        {!editing ? (
          <div className="divide-y divide-gray-800">
            <InfoRow icon={User} label="Имя пользователя" value={user.username} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Телефон" value={user.phone} />
            <InfoRow icon={Shield} label="Роль" value={user.role?.role_name === 'admin' ? 'Администратор' : 'Покупатель'} />
            <InfoRow
              icon={Calendar}
              label="Зарегистрирован"
              value={new Date(user.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
            />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Имя пользователя</label>
              <input type="text" value={form.username} onChange={set('username')} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Телефон</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 900 000 00 00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email</label>
              <input type="email" value={user.email} disabled className={inputClass + ' opacity-40 cursor-not-allowed'} />
              <p className="text-xs text-gray-600 mt-1">Email нельзя изменить</p>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                <Check size={15} /> {loading ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button type="button" onClick={handleCancel} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                <X size={15} /> Отмена
              </button>
            </div>
          </form>
        )}

        {/* Edit button */}
        {!editing && (
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-800">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Pencil size={14} /> Редактировать
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <Check size={14} /> Сохранено
              </span>
            )}
          </div>
        )}
      </div>

      {/* Мои заказы */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShoppingBag size={16} className="text-orange-400" />
            Мои заказы
          </div>
          <Link to="/orders" className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
            Все <ChevronRight size={13} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="px-6 py-5 text-sm text-gray-500">
            Заказов пока нет.{' '}
            <Link to="/catalog" className="text-orange-400 hover:text-orange-300 transition-colors">В каталог →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {orders.map(order => {
              const s = ORDER_STATUS[order.status.status_name] ?? { label: order.status.status_name, cls: 'bg-gray-700 text-gray-300' }
              return (
                <Link key={order.order_id} to={`/orders/${order.order_id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-800/40 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span className="text-sm font-semibold text-gray-200">Заказ #{order.order_id}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={10} />
                        {new Date(order.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span>·</span>
                      <span>{order.items.length} поз.</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-white">{Number(order.total_amount).toLocaleString('ru')} ₽</div>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-orange-400 transition-colors ml-auto mt-0.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Заявки на услуги */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Wrench size={16} className="text-orange-400" />
            Заявки на услуги
          </div>
          <Link to="/services" className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
            Записаться <ChevronRight size={13} />
          </Link>
        </div>
        {serviceRequests.length === 0 ? (
          <div className="px-6 py-5 text-sm text-gray-500">
            Заявок пока нет.{' '}
            <Link to="/services" className="text-orange-400 hover:text-orange-300 transition-colors">Посмотреть услуги →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {serviceRequests.map(req => {
              const s = SERVICE_STATUS[req.status] ?? { label: req.status, cls: 'bg-gray-700 text-gray-300' }
              return (
                <div key={req.request_id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span className="text-sm font-medium text-gray-200 truncate">{req.service.name}</span>
                      <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="text-gray-600">{req.car_info}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={10} />
                        {new Date(req.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
