import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.product_id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (product_id) =>
    setItems(prev => prev.filter(i => i.product_id !== product_id))

  const updateQty = (product_id, quantity) => {
    if (quantity < 1) { removeFromCart(product_id); return }
    setItems(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
