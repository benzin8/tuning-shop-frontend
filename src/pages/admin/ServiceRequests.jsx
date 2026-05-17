import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { getAllServiceRequests, updateServiceRequestStatus } from '../../api/services'

const STATUS_OPTIONS = [
  { value: 'new',         label: 'Новая',       cls: 'bg-blue-500/20 text-blue-400' },
  { value: 'confirmed',   label: 'Подтверждена', cls: 'bg-orange-500/20 text-orange-400' },
  { value: 'in_progress', label: 'В работе',    cls: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'done',        label: 'Выполнена',   cls: 'bg-green-500/20 text-green-400' },
  { value: 'cancelled',   label: 'Отменена',    cls: 'bg-red-500/20 text-red-400' },
]

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    getAllServiceRequests()
      .then(r => setRequests(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      const res = await updateServiceRequestStatus(id, status)
      setRequests(prev => prev.map(r => r.request_id === id ? res.data : r))
    } finally { setUpdating(null) }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Заявки на услуги</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : requests.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Заявок нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left px-5 py-3 font-medium">№</th>
                  <th className="text-left px-5 py-3 font-medium">Услуга</th>
                  <th className="text-left px-5 py-3 font-medium">Автомобиль</th>
                  <th className="text-left px-5 py-3 font-medium">Комментарий</th>
                  <th className="text-left px-5 py-3 font-medium">Дата</th>
                  <th className="text-left px-5 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {requests.map(req => {
                  const s = STATUS_MAP[req.status] ?? { label: req.status, cls: 'bg-gray-700 text-gray-300' }
                  return (
                    <tr key={req.request_id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">#{req.request_id}</td>
                      <td className="px-5 py-3 text-gray-200 max-w-[180px]">
                        <p className="line-clamp-1 text-sm">{req.service.name}</p>
                        <p className="text-xs text-orange-400/70">{req.service.category}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-xs whitespace-nowrap">{req.car_info}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs max-w-[160px]">
                        <p className="line-clamp-2">{req.notes ?? '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(req.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={req.status}
                          disabled={updating === req.request_id}
                          onChange={e => handleStatus(req.request_id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none disabled:opacity-50 ${s.cls}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-gray-800 text-gray-200">{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
