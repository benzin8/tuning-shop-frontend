import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, SlidersHorizontal, X, ShoppingCart, Pencil, Trash2 } from 'lucide-react'
import { getProducts, deleteProduct } from '../api/products'
import { getCategories } from '../api/categories'
import { getManufacturers } from '../api/manufacturers'
import { getBrands, getModels, getCars } from '../api/cars'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [cars, setCars] = useState([])
  const [filters, setFilters] = useState({ category_id: '', manufacturer_id: '', car_id: '' })
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { addToCart } = useCart()
  const { isAdmin } = useAuth()

  const loadProducts = (f) => {
    setLoading(true)
    const params = {}
    if (f.category_id) params.category_id = f.category_id
    if (f.manufacturer_id) params.manufacturer_id = f.manufacturer_id
    if (f.car_id) params.car_id = f.car_id
    getProducts(params)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([getCategories(), getManufacturers(), getBrands()])
      .then(([c, m, b]) => {
        setCategories(c.data)
        setManufacturers(m.data)
        setBrands(b.data)
      })
    loadProducts(filters)
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      getModels(selectedBrand).then(r => setModels(r.data))
    } else {
      setModels([])
      setSelectedModel('')
      setCars([])
    }
  }, [selectedBrand])

  useEffect(() => {
    if (selectedModel) {
      getCars(selectedModel).then(r => setCars(r.data))
    } else {
      setCars([])
      const updated = { ...filters, car_id: '' }
      setFilters(updated)
    }
  }, [selectedModel])

  useEffect(() => {
    loadProducts(filters)
  }, [filters])

  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }))

  const clearFilters = () => {
    setSelectedBrand('')
    setSelectedModel('')
    setFilters({ category_id: '', manufacturer_id: '', car_id: '' })
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (!confirm('Удалить товар?')) return
    await deleteProduct(id)
    loadProducts(filters)
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const selectClass = "w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Каталог</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">{products.length} товаров</p>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 text-sm border rounded-xl px-4 py-2 transition-colors ${
            showFilters || hasFilters
              ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
              : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          Фильтры
          {hasFilters && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
        </button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Категория</label>
              <select value={filters.category_id} onChange={setFilter('category_id')} className={selectClass}>
                <option value="">Все</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Производитель</label>
              <select value={filters.manufacturer_id} onChange={setFilter('manufacturer_id')} className={selectClass}>
                <option value="">Все</option>
                {manufacturers.map(m => (
                  <option key={m.manufacturer_id} value={m.manufacturer_id}>{m.manufacturer_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Марка авто</label>
              <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className={selectClass}>
                <option value="">Все марки</option>
                {brands.map(b => (
                  <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Модель</label>
              <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand} className={selectClass}>
                <option value="">Все модели</option>
                {models.map(m => (
                  <option key={m.model_id} value={m.model_id}>{m.model_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Год / поколение</label>
              <select value={filters.car_id} onChange={setFilter('car_id')} disabled={!selectedModel} className={selectClass}>
                <option value="">Все</option>
                {cars.map(c => (
                  <option key={c.car_id} value={c.car_id}>
                    {c.year_start}–{c.year_end ?? '...'}{c.generation ? ` ${c.generation}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 mt-3 transition-colors">
              <X size={14} /> Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {/* Скелетон */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="w-full h-44 bg-gray-800 rounded-xl mb-4" />
              <div className="h-3 bg-gray-800 rounded mb-2 w-1/3" />
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-800 rounded w-2/4 mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-800 rounded w-1/3" />
                <div className="w-8 h-8 bg-gray-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Пусто */
        <div className="text-center py-24">
          <Package size={52} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-400 font-medium">Товары не найдены</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-orange-400 hover:text-orange-300 text-sm transition-colors">
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        /* Сетка товаров */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.product_id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col group">
              <Link to={`/product/${p.product_id}`}>
                <div className="w-full h-44 bg-gray-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:bg-gray-700/70 transition-colors">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover" />
                    : <Package size={36} className="text-gray-600" />
                  }
                </div>
                <div className="text-xs text-orange-500 font-medium mb-1">{p.category.category_name}</div>
                <div className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-2">{p.product_name}</div>
                <div className="text-xs text-gray-500 font-mono mb-3">{p.sku}</div>
              </Link>

              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="font-bold text-white">{Number(p.price).toLocaleString('ru')} ₽</span>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <Link
                        to={`/product/${p.product_id}`}
                        className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, p.product_id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => addToCart({
                      product_id: p.product_id,
                      product_name: p.product_name,
                      price: p.price,
                      image_url: p.image_url,
                    })}
                    className="p-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors"
                    title="В корзину"
                  >
                    <ShoppingCart size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
