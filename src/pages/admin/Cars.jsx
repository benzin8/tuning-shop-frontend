import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronRight } from 'lucide-react'
import { getBrands, createBrand, deleteBrand, getModels, createModel, deleteModel, getCars, createCar, deleteCar } from '../../api/cars'

function AddForm({ placeholder, onAdd, disabled }) {
  const [val, setVal] = useState('')
  const handle = async (e) => {
    e.preventDefault()
    if (!val.trim()) return
    await onAdd(val.trim())
    setVal('')
  }
  return (
    <form onSubmit={handle} className="flex gap-2 mt-3">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors" />
      <button disabled={disabled || !val.trim()} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shrink-0">
        <Plus size={13} />
      </button>
    </form>
  )
}

function Panel({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800 max-h-[500px]">
        {children}
      </div>
    </div>
  )
}

export default function AdminCars() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [cars, setCars] = useState([])
  const [selBrand, setSelBrand] = useState(null)
  const [selModel, setSelModel] = useState(null)
  const [carForm, setCarForm] = useState({ year_start: '', year_end: '', generation: '' })

  useEffect(() => { getBrands().then(r => setBrands(r.data)) }, [])

  const selectBrand = (b) => {
    setSelBrand(b); setSelModel(null); setCars([])
    getModels(b.brand_id).then(r => setModels(r.data))
  }
  const selectModel = (m) => {
    setSelModel(m)
    getCars(m.model_id).then(r => setCars(r.data))
  }

  const addBrand = async (name) => {
    const res = await createBrand(name)
    setBrands(prev => [...prev, res.data])
  }
  const rmBrand = async (id) => {
    if (!confirm('Удалить марку и все её модели/авто?')) return
    await deleteBrand(id)
    setBrands(prev => prev.filter(b => b.brand_id !== id))
    if (selBrand?.brand_id === id) { setSelBrand(null); setModels([]); setSelModel(null); setCars([]) }
  }
  const addModel = async (name) => {
    const res = await createModel({ brand_id: selBrand.brand_id, model_name: name })
    setModels(prev => [...prev, res.data])
  }
  const rmModel = async (id) => {
    if (!confirm('Удалить модель и все её записи?')) return
    await deleteModel(id)
    setModels(prev => prev.filter(m => m.model_id !== id))
    if (selModel?.model_id === id) { setSelModel(null); setCars([]) }
  }
  const addCar = async (e) => {
    e.preventDefault()
    if (!carForm.year_start) return
    const res = await createCar({ model_id: selModel.model_id, year_start: parseInt(carForm.year_start), year_end: carForm.year_end ? parseInt(carForm.year_end) : null, generation: carForm.generation || null })
    setCars(prev => [...prev, res.data])
    setCarForm({ year_start: '', year_end: '', generation: '' })
  }
  const rmCar = async (id) => {
    if (!confirm('Удалить запись?')) return
    await deleteCar(id)
    setCars(prev => prev.filter(c => c.car_id !== id))
  }

  const inp = "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors w-full"

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Автомобили</h1>

      <div className="grid grid-cols-3 gap-4">
        {/* Марки */}
        <Panel title="Марки">
          {brands.map(b => (
            <div key={b.brand_id} className={`flex items-center group transition-colors ${selBrand?.brand_id === b.brand_id ? 'bg-orange-500/10' : 'hover:bg-gray-800/50'}`}>
              <button onClick={() => selectBrand(b)}
                className={`flex-1 flex items-center justify-between px-4 py-3 text-sm text-left ${selBrand?.brand_id === b.brand_id ? 'text-orange-400' : 'text-gray-300'}`}>
                {b.brand_name}
                <ChevronRight size={14} className="text-gray-600" />
              </button>
              <button onClick={() => rmBrand(b.brand_id)} className="px-3 py-3 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <div className="px-3 py-2">
            <AddForm placeholder="Новая марка" onAdd={addBrand} />
          </div>
        </Panel>

        {/* Модели */}
        <Panel title={selBrand ? `Модели — ${selBrand.brand_name}` : 'Выберите марку'}>
          {!selBrand ? (
            <p className="px-4 py-3 text-sm text-gray-600">←</p>
          ) : (
            <>
              {models.map(m => (
                <div key={m.model_id} className={`flex items-center group transition-colors ${selModel?.model_id === m.model_id ? 'bg-orange-500/10' : 'hover:bg-gray-800/50'}`}>
                  <button onClick={() => selectModel(m)}
                    className={`flex-1 flex items-center justify-between px-4 py-3 text-sm text-left ${selModel?.model_id === m.model_id ? 'text-orange-400' : 'text-gray-300'}`}>
                    {m.model_name}
                    <ChevronRight size={14} className="text-gray-600" />
                  </button>
                  <button onClick={() => rmModel(m.model_id)} className="px-3 py-3 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="px-3 py-2">
                <AddForm placeholder="Новая модель" onAdd={addModel} />
              </div>
            </>
          )}
        </Panel>

        {/* Поколения/Годы */}
        <Panel title={selModel ? `Годы — ${selModel.model_name}` : 'Выберите модель'}>
          {!selModel ? (
            <p className="px-4 py-3 text-sm text-gray-600">←</p>
          ) : (
            <>
              {cars.map(c => (
                <div key={c.car_id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors">
                  <span className="text-sm text-gray-300">
                    {c.year_start}–{c.year_end ?? '...'}{c.generation ? ` ${c.generation}` : ''}
                  </span>
                  <button onClick={() => rmCar(c.car_id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <form onSubmit={addCar} className="px-3 py-3 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={carForm.year_start} onChange={e => setCarForm(f => ({ ...f, year_start: e.target.value }))} placeholder="Год от" type="number" className={inp} />
                  <input value={carForm.year_end} onChange={e => setCarForm(f => ({ ...f, year_end: e.target.value }))} placeholder="Год до" type="number" className={inp} />
                </div>
                <input value={carForm.generation} onChange={e => setCarForm(f => ({ ...f, generation: e.target.value }))} placeholder="Поколение (необяз.)" className={inp} />
                <button type="submit" disabled={!carForm.year_start} className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                  <Plus size={13} /> Добавить
                </button>
              </form>
            </>
          )}
        </Panel>
      </div>
    </div>
  )
}
