'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { Trash2Icon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStores() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [storeToDelete, setStoreToDelete] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")

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

    const closeDeleteModal = () => {
        setStoreToDelete(null)
        setDeleteConfirmation("")
    }

    const permanentlyDeleteStore = async () => {
        if (!storeToDelete) {
            return
        }

        const response = await fetch("/api/admin/store", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                storeId: storeToDelete.id,
                confirmation: deleteConfirmation,
            }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to permanently delete store")
        }

        setStores((currentStores) =>
            currentStores.filter((store) => store.id !== storeToDelete.id)
        )
        closeDeleteModal()

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
                                <button
                                    type="button"
                                    onClick={() => setStoreToDelete(store)}
                                    className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                >
                                    <Trash2Icon size={16} />
                                    Permanently delete
                                </button>
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
            {storeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 text-slate-700 backdrop-blur-xs">
                    <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
                            aria-label="Close delete confirmation"
                        >
                            <XIcon size={22} />
                        </button>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold uppercase text-red-600">Permanent deletion</p>
                                <h2 className="mt-1 pr-8 text-xl font-semibold text-slate-900">
                                    Delete {storeToDelete.name}?
                                </h2>
                            </div>
                            <p className="text-sm leading-6 text-slate-600">
                                This will permanently remove this shop, its products, orders, ratings, and store data. This action cannot be undone.
                            </p>
                            <label className="block text-sm font-medium text-slate-700">
                                Type <span className="font-semibold text-slate-900">{storeToDelete.name}</span> to confirm
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                                    className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-red-500"
                                />
                            </label>
                            <div className="flex flex-wrap justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="rounded bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={deleteConfirmation !== storeToDelete.name}
                                    onClick={() => toast.promise(permanentlyDeleteStore(), {
                                        loading: "Permanently deleting store...",
                                        success: (message) => message || "Store permanently deleted",
                                        error: (error) => error.message || "Failed to permanently delete store",
                                    })}
                                    className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                                >
                                    <Trash2Icon size={16} />
                                    Permanently delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : <Loading />
}
