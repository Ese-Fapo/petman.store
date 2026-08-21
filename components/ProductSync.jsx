'use client'

import { setProduct } from "@/lib/features/product/productSlice"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const ProductSync = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch("/api/products")
                const data = await response.json()

                if (response.ok && Array.isArray(data.products)) {
                    dispatch(setProduct(data.products))
                }
            } catch {
                // Keep the bundled products available if the live product list cannot load.
            }
        }

        loadProducts()
    }, [dispatch])

    return null
}

export default ProductSync
