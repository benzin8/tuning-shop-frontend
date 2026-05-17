import { useState, useEffect } from 'react'
import { Package, Plus, Pencil, Trash2, X, Check, ArchiveRestore } from 'lucide-react'
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct, restoreProduct } from '../../api/products'
import { getCategories } from '../../api/categories'
import { getManufacturers } from '../../api/manufacturers'

const EMPTY_FORM = { product_name: '', sku: '', category_id: '', manufacturer_id: '', price: '', stock_quantity: '0', description: '', image_url: '' }

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { mode: 'create' | 'edit', product?: {} }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getAllProductsAdmin(), getCategories(), getManufacturers()])
      .then(([p, c, m]) => { setProducts(p.data); setCategories(c.data); setManufacturers(m.data) })
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal({ mode: 'create' }) }
  const openEdit = (p) => {
    setForm({ product_name: p.product_name, sku: p.sku, category_id: p.category.category_id, manufacturer_id: p.manufacturer.manufacturer_id, price: p.price, stock_quantity: p.stock_quantity, description: p.description ?? '', image_url: p.image_url ?? '' })
    setError('')
    setModal({ mode: 'edit', product: p })
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = { product_name: form.product_name, category_id: parseInt(form.category_id), manufacturer_id: parseInt(form.manufacturer_id), price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity), description: form.description || null, image_url: form.image_url || null }
      if (modal.mode === 'create') {
        const res = await createProduct({ ...payload, sku: form.sku })
        setProducts(prev => [...prev, res.data])
      } else {
        const res = await updateProduct(modal.product.product_id, payload)
        setProducts(prev => prev.map(p => p.product_id === modal.product.product_id ? res.data : p))
      }
      setModal(null)
    } catch (err) {
      const d = err.response?.data?.detail
      setError(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Ошибка')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Архивировать товар? Он скроется из каталога.')) return
    try {
      await deleteProduct(id)
      setProducts(prev => prev.map(p => p.product_id === id ? { ...p, is_active: false } : p))
    } catch (err) {
      const d = err.response?.data?.detail
      alert(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Ошибка при архивировании')
    }
  }

  const handleRestore = async (id) => {
    try {
      const res = await restoreProduct(id)
      setProducts(prev => prev.map(p => p.product_id === id ? res.data : p))
    } catch (err) {
      const d = err.response?.data?.detail
      alert(Array.isArray(d) ? d.map(x => x.msg).join(', ') : d || 'Ошибка при восстановлении')
    }
  }

  const inp = "w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
  const sel = inp + " cursor-pointer"

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Товары</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left px-4 py-3 font-medium">Фото</th>
                  <th className="text-left px-4 py-3 font-medium">Название / SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Категория</th>
                  <th className="text-left px-4 py-3 font-medium">Цена</th>
                  <th className="text-left px-4 py-3 font-medium">Склад</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map(p => (
                  <tr key={p.product_id} className={`transition-colors ${p.is_active ? 'hover:bg-gray-800/30' : 'opacity-50 hover:bg-gray-800/20'}`}>
                    <td className="px-4 py-2.5">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-600" />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-gray-200 font-medium leading-snug line-clamp-1">{p.product_name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">{p.sku}</span>
                        {!p.is_active && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Архив</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{p.category.category_name}</td>
                    <td className="px-4 py-2.5 text-white font-semibold whitespace-nowrap">{Number(p.price).toLocaleString('ru')} ₽</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock_quantity > 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {p.is_active ? (
                          <>
                            <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => handleDelete(p.product_id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </>
                        ) : (
                          <button onClick={() => handleRestore(p.product_id)} title="Восстановить" className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors"><ArchiveRestore size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.mode === 'create' ? 'Новый товар' : 'Редактировать товар'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Название *</label>
              <input required value={form.product_name} onChange={set('product_name')} className={inp} />
            </div>
            {modal.mode === 'create' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">SKU <span className="text-gray-600">(необяз., генерируется автоматически)</span></label>
                <input value={form.sku} onChange={set('sku')} placeholder="Оставьте пустым" className={inp} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Категория *</label>
                <select required value={form.category_id} onChange={set('category_id')} className={sel}>
                  <option value="">—</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Производитель *</label>
                <select required value={form.manufacturer_id} onChange={set('manufacturer_id')} className={sel}>
                  <option value="">—</option>
                  {manufacturers.map(m => <option key={m.manufacturer_id} value={m.manufacturer_id}>{m.manufacturer_name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Цена ₽ *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">На складе</label>
                <input type="number" min="0" value={form.stock_quantity} onChange={set('stock_quantity')} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL фото</label>
              <input value={form.image_url} onChange={set('image_url')} placeholder="https://..." className={inp} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Описание</label>
              <textarea rows={3} value={form.description} onChange={set('description')} className={inp + ' resize-none'} />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Check size={15} /> {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors">Отмена</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
