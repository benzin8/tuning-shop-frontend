import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, ArrowRight,
  Layers, Zap, ShieldCheck, Wind, Cog, Car,
  Truck, BadgeCheck, RotateCcw,
  Package, TrendingUp,
} from 'lucide-react'
import { getProducts } from '../api/products'
import { getBrands, getModels, getCars } from '../api/cars'
import { useCart } from '../contexts/CartContext'

const CATEGORIES = [
  { name: 'Подвеска', icon: Layers, count: '240+ товаров' },
  { name: 'Двигатель', icon: Cog, count: '180+ товаров' },
  { name: 'Тормоза', icon: ShieldCheck, count: '150+ товаров' },
  { name: 'Выхлоп', icon: Wind, count: '90+ товаров' },
  { name: 'Электрика', icon: Zap, count: '210+ товаров' },
  { name: 'Трансмиссия', icon: Car, count: '120+ товаров' },
  { name: 'Кузов', icon: Package, count: '300+ товаров' },
  { name: 'Тюнинг', icon: TrendingUp, count: '160+ товаров' },
]

const FEATURES = [
  {
    icon: Truck,
    title: 'Быстрая доставка',
    text: 'Отправка в день заказа при наличии на складе. Доставка по всей России.',
  },
  {
    icon: BadgeCheck,
    title: 'Оригинальные запчасти',
    text: 'Работаем только с проверенными производителями и официальными поставщиками.',
  },
  {
    icon: Car,
    title: 'Подбор по автомобилю',
    text: 'Фильтр по марке, модели и году — только совместимые детали для вашего авто.',
  },
  {
    icon: RotateCcw,
    title: 'Возврат 14 дней',
    text: 'Не подошла деталь — вернём деньги без лишних вопросов в течение 14 дней.',
  },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [cars, setCars] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedCar, setSelectedCar] = useState('')
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    getProducts({ limit: 4 }).then(r => setProducts(r.data))
    getBrands().then(r => setBrands(r.data))
  }, [])

  useEffect(() => {
    setSelectedModel('')
    setSelectedCar('')
    setModels([])
    setCars([])
    if (selectedBrand) getModels(selectedBrand).then(r => setModels(r.data))
  }, [selectedBrand])

  useEffect(() => {
    setSelectedCar('')
    setCars([])
    if (selectedModel) getCars(selectedModel).then(r => setCars(r.data))
  }, [selectedModel])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedCar) params.set('car_id', selectedCar)
    else if (selectedModel) params.set('model_id', selectedModel)
    navigate(`/catalog?${params.toString()}`)
  }

  const selectClass = "flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"

  return (
    <div className="bg-gray-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24">
          {/* badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
            <TrendingUp size={14} />
            Более 1 000 запчастей в наличии
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-5 max-w-3xl">
            Запчасти для{' '}
            <span className="text-orange-500">тюнинга</span>{' '}
            и обслуживания авто
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
            Подберите детали точно под ваш автомобиль — по марке, модели и году выпуска.
          </p>

          {/* поиск по авто */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-6">
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className={selectClass}>
              <option value="">Марка</option>
              {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
            </select>
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!selectedBrand} className={selectClass}>
              <option value="">Модель</option>
              {models.map(m => <option key={m.model_id} value={m.model_id}>{m.model_name}</option>)}
            </select>
            <select value={selectedCar} onChange={e => setSelectedCar(e.target.value)} disabled={!selectedModel} className={selectClass}>
              <option value="">Год</option>
              {cars.map(c => (
                <option key={c.car_id} value={c.car_id}>
                  {c.year_start}–{c.year_end ?? '...'}{c.generation ? ` ${c.generation}` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={!selectedBrand}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 transition-colors shrink-0"
            >
              <Search size={16} />
              Найти
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/catalog" className="flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors group">
              Весь каталог
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-gray-700">·</span>
            <a href="#categories" className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
              Популярные категории ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Статистика ── */}
      <div className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1 000+', label: 'Товаров' },
            { value: '50+',    label: 'Производителей' },
            { value: '500+',   label: 'Автомобилей' },
            { value: '1 день', label: 'Отправка' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Категории ── */}
      <section id="categories" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Категории</h2>
            <p className="text-gray-400 mt-1 text-sm">Найдите нужную деталь по типу</p>
          </div>
          <Link to="/catalog" className="text-orange-500 hover:text-orange-400 text-sm flex items-center gap-1 transition-colors group">
            Все категории
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(({ name, icon: Icon, count }) => (
            <Link
              key={name}
              to="/catalog"
              className="flex flex-col items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-orange-500/40 hover:bg-gray-800/80 transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-800 group-hover:bg-orange-500/10 flex items-center justify-center transition-colors">
                <Icon size={22} className="text-gray-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Популярные товары ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Популярные товары</h2>
            <p className="text-gray-400 mt-1 text-sm">Самые покупаемые позиции</p>
          </div>
          <Link to="/catalog" className="text-orange-500 hover:text-orange-400 text-sm flex items-center gap-1 transition-colors group">
            Все товары
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.product_id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 hover:bg-gray-800/60 transition-all group flex flex-col">
              <Link to={`/product/${p.product_id}`} className="block">
                <div className="w-full h-40 bg-gray-800 rounded-xl mb-4 overflow-hidden flex items-center justify-center group-hover:bg-gray-700/80 transition-colors">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover" />
                    : <Package size={40} className="text-gray-600" />
                  }
                </div>
                <div className="text-xs text-orange-500 font-medium mb-1">{p.category.category_name}</div>
                <div className="text-sm font-semibold text-white mb-1 leading-snug line-clamp-2">{p.product_name}</div>
                <div className="text-xs text-gray-500 font-mono mb-3">{p.sku}</div>
              </Link>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-bold text-white">{Number(p.price).toLocaleString('ru')} ₽</span>
                <button
                  onClick={() => addToCart({ product_id: p.product_id, product_name: p.product_name, price: p.price, image_url: p.image_url })}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Преимущества ── */}
      <section className="border-t border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">Почему выбирают нас</h2>
            <p className="text-gray-400 mt-2 text-sm">Работаем для вашего удобства</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-start gap-4 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icon size={20} className="text-orange-400" />
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">{title}</div>
                  <div className="text-sm text-gray-400 leading-relaxed">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA баннер ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl px-8 py-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Не знаете, что нужно?</h2>
            <p className="text-orange-100 mb-6 text-lg">
              Подберём запчасти точно под ваш автомобиль — просто выберите марку и модель.
            </p>
            <Link to="/catalog" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-7 py-3.5 rounded-xl hover:bg-orange-50 transition-colors">
              Подобрать по авто
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
