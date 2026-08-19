'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchStoreData = async () => {
        if (!username) {
            return
        }

        try {
            setLoading(true)
            setError("")

            const response = await fetch(`/api/store/data?username=${encodeURIComponent(username)}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch store")
            }

            setStoreInfo(data.store)
            setProducts(Array.isArray(data.products) ? data.products : [])
        } catch (error) {
            setStoreInfo(null)
            setProducts([])
            setError(error.message || "Failed to fetch store")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStoreData()
    }, [username])

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center text-center">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Store not available</h1>
                    <p className="mt-2 text-sm text-slate-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-6">

            {/* Store Info Banner */}
            {storeInfo && (
                <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                    <Image
                        src={storeInfo.logo}
                        alt={storeInfo.name}
                        className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
                        width={200}
                        height={200}
                    />
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                        <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description}</p>
                        <div className="text-xs text-slate-500 mt-4 space-y-1"></div>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.address}</span>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                                <span>{storeInfo.email}</span>
                            </div>
                           
                        </div>
                    </div>
                </div>
            )}

            {/* Products */}
            <div className=" max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
                    {products.length ? products.map((product) => <ProductCard key={product.id} product={product} />) : (
                        <p className="col-span-2 text-sm text-slate-500">No products available from this store yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
