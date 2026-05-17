import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { register } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ ...form, phone: form.phone || null })
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join('. '))
      } else {
        setError(detail || 'Ошибка регистрации')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
            <Wrench size={22} />
            TuningShop
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Регистрация</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Имя пользователя</label>
              <input type="text" value={form.username} onChange={set('username')} required className={inputClass} placeholder="username" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} required className={inputClass} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Телефон <span className="text-gray-600">(необязательно)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+7 900 000 00 00" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Пароль <span className="text-gray-600">(мин. 6 символов)</span></label>
              <input type="password" value={form.password} onChange={set('password')} required className={inputClass} placeholder="••••••" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Регистрируем...' : 'Создать аккаунт'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
