import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getManufacturers, createManufacturer, deleteManufacturer } from '../../api/manufacturers'

export default function AdminManufacturers() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { getManufacturers().then(r => setItems(r.data)) }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true); setError('')
    try {
      const res = await createManufacturer(name.trim())
      setItems(prev => [...prev, res.data])
      setName('')
    } catch (err) {
      const d = err.response?.data?.detail
      setError(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Ошибка')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить производителя?')) return
    try {
      await deleteManufacturer(id)
      setItems(prev => prev.filter(x => x.manufacturer_id !== id))
    } catch (err) {
      const d = err.response?.data?.detail
      setError(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Ошибка при удалении')
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-white mb-6">Производители</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Название производителя"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
        />
        <button disabled={saving || !name.trim()} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
          <Plus size={15} /> Добавить
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">Нет производителей</p>
        ) : items.map(m => (
          <div key={m.manufacturer_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/30 transition-colors">
            <span className="text-sm text-gray-200">{m.manufacturer_name}</span>
            <button onClick={() => handleDelete(m.manufacturer_id)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
