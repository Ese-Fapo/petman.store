'use client'

import { setProduct, setProductError, setProductLoading } from "@/lib/features/product/productSlice"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const ProductSync = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const loadProducts = async () => {
            try {
                dispatch(setProductLoading(true))
                const response = await fetch("/api/products")
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch products")
                }

                dispatch(setProduct(Array.isArray(data.products) ? data.products : []))
            } catch (error) {
                dispatch(setProductError(error.message || "Failed to fetch products"))
            }
        }

        loadProducts()
    }, [dispatch])

    return null
}

export default ProductSync
