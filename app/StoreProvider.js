'use client'
import CartSync from '@/components/CartSync'
import ProductSync from '@/components/ProductSync'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <ProductSync />
      <CartSync />
      {children}
    </Provider>
  )
}
