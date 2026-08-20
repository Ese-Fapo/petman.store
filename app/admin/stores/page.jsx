'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStores() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    // Load approved stores that admins can make live or inactive.
    const fetchStores = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/admin/store")
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch stores")
            }

            setStores(Array.isArray(data.stores) ? data.stores : [])
        } catch (error) {
            toast.error(error.message || "Failed to fetch stores")
        } finally {
            setLoading(false)
        }
    }

    // Toggle one store and replace it with the updated server response.
    const toggleIsActive = async (storeId, isActive) => {
        const response = await fetch("/api/admin/toggle-store", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ storeId, isActive }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update store")
        }

        setStores((currentStores) =>
            currentStores.map((store) =>
                store.id === storeId ? data.store : store
            )
        )

        return data.message
    }

    useEffect(() => {
        fetchStores()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Live <span className="text-slate-800 font-medium">Stores</span></h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2 flex-wrap">
                                <p>Active</p>
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                                    <input type="checkbox" className="sr-only peer" onChange={(event) => toast.promise(toggleIsActive(store.id, event.target.checked), {
                                        loading: "Updating data...",
                                        success: (message) => message || "Store updated successfully",
                                        error: (error) => error.message || "Failed to update store",
                                    })} checked={store.isActive} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </div>
                        </div>
                    ))}

                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No stores Available</h1>
                </div>
            )
            }
        </div>
    ) : <Loading />
}
