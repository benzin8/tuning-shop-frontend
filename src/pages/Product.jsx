import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Package, ShoppingCart, ArrowLeft, Car, Pencil, Trash2,
  CheckCircle2, XCircle, Tag, Wrench,
} from 'lucide-react'
import { getProduct, deleteProduct, getProductCompatibility } from '../api/products'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

function CarBadge({ car }) {
  const years = car.year_end
    ? `${car.year_start}–${car.year_end}`
    : `с ${car.year_start}`
  const gen = car.generation ? ` · ${car.generation}` : ''
  return (
    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm">
      <Car size={14} className="text-orange-500 shrink-0" />
      <span className="text-gray-200 font-medium">{car.model.brand.brand_name} {car.model.model_name}</span>
      <span className="text-gray-500">{years}{gen}</span>
    </div>
  )
}

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, items } = useCart()
  const { isAdmin } = useAuth()

  const [product, setProduct] = useState(null)
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), getProductCompatibility(id)])
      .then(([p, c]) => {
        setProduct(p.data)
        setCars(c.data)
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const inCart = items.some(i => i.product_id === product?.product_id)

  const handleAddToCart = () => {
    addToCart({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      image_url: product.image_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm('Удалить товар?')) return
    await deleteProduct(id)
    navigate('/catalog')
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-40 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="h-96 bg-gray-900 border border-gray-800 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-8 bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="h-10 bg-gray-800 rounded w-1/4 mt-6" />
          <div className="h-4 bg-gray-800 rounded" />
          <div className="h-4 bg-gray-800 rounded w-5/6" />
          <div className="h-12 bg-gray-800 rounded-xl mt-8" />
        </div>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <Package size={56} className="mx-auto mb-4 text-gray-700" />
      <p className="text-white font-semibold text-lg mb-2">Товар не найден</p>
      <p className="text-gray-500 text-sm mb-6">Возможно, он был удалён или недоступен</p>
      <Link to="/catalog" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
        ← Вернуться в каталог
      </Link>
    </div>
  )

  if (!product) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
        <ArrowLeft size={15} />
        Каталог
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center overflow-hidden aspect-square md:aspect-auto md:min-h-80">
          {product.image_url
            ? <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
            : (
              <div className="flex flex-col items-center gap-3 text-gray-700 py-16">
                <Package size={72} />
                <span className="text-sm">Фото отсутствует</span>
              </div>
            )
          }
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              <Tag size={11} />
              {product.category.category_name}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full">
              <Wrench size={11} />
              {product.manufacturer.manufacturer_name}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white leading-snug mb-2">{product.product_name}</h1>
          <p className="text-xs text-gray-600 font-mono mb-6">SKU: {product.sku}</p>

          {/* Price + stock */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-white">{Number(product.price).toLocaleString('ru')} ₽</span>
            {product.stock_quantity > 0
              ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 size={14} />
                  В наличии: {product.stock_quantity} шт.
                </span>
              )
              : (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
                  <XCircle size={14} />
                  Нет в наличии
                </span>
              )
            }
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{product.description}</p>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                added
                  ? 'bg-green-600 text-white'
                  : product.stock_quantity === 0
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-400 text-white'
              }`}
            >
              <ShoppingCart size={17} />
              {added ? 'Добавлено в корзину!' : inCart ? 'Ещё раз в корзину' : 'В корзину'}
            </button>

            {inCart && !added && (
              <Link
                to="/cart"
                className="text-center text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Перейти в корзину →
              </Link>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Trash2 size={14} />
                  Удалить товар
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compatible cars */}
      {cars.length > 0 && (
        <div className="border-t border-gray-800 pt-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Совместимые автомобили
            <span className="ml-2 text-sm text-gray-600 font-normal">({cars.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {cars.map(car => <CarBadge key={car.car_id} car={car} />)}
          </div>
        </div>
      )}
    </div>
  )
}
