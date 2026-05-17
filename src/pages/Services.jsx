import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Cog, Layers, Wind, ShieldCheck, Package, Zap,
  Clock, CheckCircle2, X, ChevronRight,
} from 'lucide-react'
import { getServices, createServiceRequest } from '../api/services'
import { useAuth } from '../contexts/AuthContext'

const CATEGORY_ICONS = {
  'Двигатель': Cog,
  'Подвеска': Layers,
  'Выхлоп': Wind,
  'Тормоза': ShieldCheck,
  'Кузов': Package,
  'Электрика': Zap,
}

const STATUS_LABELS = {
  new: { label: 'Новая', cls: 'bg-blue-500/20 text-blue-400' },
  confirmed: { label: 'Подтверждена', cls: 'bg-orange-500/20 text-orange-400' },
  in_progress: { label: 'В работе', cls: 'bg-yellow-500/20 text-yellow-400' },
  done: { label: 'Выполнена', cls: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Отменена', cls: 'bg-red-500/20 text-red-400' },
}

function BookingModal({ service, onClose, onSuccess }) {
  const [carInfo, setCarInfo] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!carInfo.trim()) { setError('Укажите информацию об автомобиле'); return }
    setLoading(true)
    setError('')
    try {
      await createServiceRequest({ service_id: service.service_id, car_info: carInfo, notes: notes || null })
      onSuccess()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-white mb-1">Записаться на услугу</h2>
        <p className="text-sm text-orange-400 mb-5">{service.name}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Автомобиль *</label>
            <input
              type="text"
              value={carInfo}
              onChange={e => setCarInfo(e.target.value)}
              placeholder="Toyota Camry 2019, 2.5 AT"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Комментарий</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Дополнительные пожелания или описание проблемы..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Заявка принята!</h2>
        <p className="text-sm text-gray-400 mb-6">
          Мы свяжемся с вами для подтверждения времени и деталей.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Отлично
        </button>
      </div>
    </div>
  )
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    getServices()
      .then(r => setServices(r.data))
      .finally(() => setLoading(false))
  }, [])

  const grouped = services.reduce((acc, s) => {
    const key = s.category || 'Другое'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const handleBook = (service) => {
    if (!user) return
    setBooking(service)
  }

  const handleSuccess = () => {
    setBooking(null)
    setShowSuccess(true)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {[1, 2].map(i => (
        <div key={i}>
          <div className="h-5 bg-gray-800 rounded w-32 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(j => <div key={j} className="h-48 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <div className="bg-gray-950">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-gray-800/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(249,115,22,0.12),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '36px 36px' }}
          />
          <div className="relative max-w-6xl mx-auto px-4 py-14">
            <h1 className="text-4xl font-bold text-white mb-3">Услуги тюнинга</h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Профессиональный монтаж, настройка и доработка автомобилей любых марок и моделей.
            </p>
          </div>
        </div>

        {/* Services grouped by category */}
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
          {Object.entries(grouped).map(([category, items]) => {
            const Icon = CATEGORY_ICONS[category] ?? Cog
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Icon size={18} className="text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{category}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(service => (
                    <div
                      key={service.service_id}
                      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">{service.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {service.duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} />
                              {service.duration}
                            </span>
                          )}
                          {service.price_from && (
                            <span className="text-white font-semibold text-sm">
                              от {Number(service.price_from).toLocaleString('ru')} ₽
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-gray-800">
                        {user ? (
                          <button
                            onClick={() => handleBook(service)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors group"
                          >
                            Записаться
                            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-400 transition-colors group"
                          >
                            Войдите, чтобы записаться
                            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {booking && (
        <BookingModal
          service={booking}
          onClose={() => setBooking(null)}
          onSuccess={handleSuccess}
        />
      )}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </>
  )
}
