import { Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2 text-orange-500 font-bold">
          <Wrench size={16} />
          TuningShop
        </div>
        <div className="flex gap-6">
          <Link to="/catalog" className="hover:text-gray-200 transition-colors">Каталог</Link>
          <Link to="/delivery" className="hover:text-gray-200 transition-colors">Доставка</Link>
          <Link to="/returns" className="hover:text-gray-200 transition-colors">Возврат</Link>
        </div>
        <div>© 2025 TuningShop</div>
      </div>
    </footer>
  )
}
