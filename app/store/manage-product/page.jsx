'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"

export default function StoreManageProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const formatPrice = (price) => Number(price || 0).toLocaleString()

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/store/product")
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch products")
            }

            setProducts(data.products || [])
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleStock = async (productId) => {
        const response = await fetch("/api/store/stock-toggle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update product stock")
        }

        setProducts((currentProducts) =>
            currentProducts.map((product) =>
                product.id === productId
                    ? { ...product, inStock: data.product.inStock }
                    : product
            )
        )

        return data.message
    }

    useEffect(() => {
            fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.length ? products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    {product.images?.[0] ? (
                                        <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={product.images[0]} alt={product.name || "Product image"} />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-slate-100" />
                                    )}
                                    {product.name || "Unnamed product"}
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description || ""}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {formatPrice(product.mrp)}</td>
                            <td className="px-4 py-3">{currency} {formatPrice(product.price)}</td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id), { loading: "Updating data..." })} checked={product.inStock} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                        </tr>
                    )) : (
                        <tr className="border-t border-gray-200">
                            <td className="px-4 py-6 text-center text-slate-400" colSpan={5}>No products found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}
