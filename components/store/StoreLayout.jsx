'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"

const StoreLayout = ({ children }) => {


    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)
    const [error, setError] = useState("")

    const fetchIsSeller = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch("/api/store/is-seller")
            const data = await response.json()

            if (!response.ok) {
                setIsSeller(false)
                setStoreInfo(null)
                setError(data.error || "Not authorized")
                return
            }

            setIsSeller(Boolean(data.isSeller))
            setStoreInfo(data.storeInfo || null)
        } catch (error) {
            setIsSeller(false)
            setStoreInfo(null)
            setError(error.message || "Failed to verify seller access")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIsSeller()
    }, [])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex min-h-screen flex-col bg-white">
            <SellerNavbar />
            <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
                <SellerSidebar storeInfo={storeInfo} />
                <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:pl-12 lg:pt-12">
                    {children}
                </main>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            {error && <p className="mt-3 text-sm text-slate-400">{error}</p>}
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout
