import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Shield, Calendar, Check, Pencil, X } from 'lucide-react'
import { updateMe } from '../api/users'
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

export default function Profile() {
  const { user, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username ?? '', phone: user?.phone ?? '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

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

      {/* Quick links */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-3">Быстрые ссылки</h2>
        <div className="flex flex-col gap-2">
          <Link to="/orders" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
            → Мои заказы
          </Link>
          <Link to="/catalog" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
            → Каталог
          </Link>
        </div>
      </div>
    </div>
  )
}
