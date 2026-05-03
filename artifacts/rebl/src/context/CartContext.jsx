import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addToCart = (product, variant) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variant === variant)
      if (existing) return prev.map(i =>
        i.product.id === product.id && i.variant === variant ? { ...i, qty: i.qty + 1 } : i
      )
      return [...prev, { product, variant, qty: 1, id: Date.now() }]
    })
    setIsOpen(true)
  }

  const removeFromCart = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, delta) => setItems(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  )

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  )
}
