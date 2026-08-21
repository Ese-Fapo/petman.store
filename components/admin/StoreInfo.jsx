'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

const StoreInfo = ({ store }) => {
    const statusClass = store.status === 'pending'
        ? 'bg-yellow-100 text-yellow-800'
        : store.status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'

    return (
        <div className="min-w-0 flex-1 space-y-2 text-sm">
            {store.logo ? (
                <Image width={100} height={100} src={store.logo} alt={store.name || "Store logo"} className="max-w-20 max-h-20 object-contain shadow rounded-full max-sm:mx-auto" />
            ) : (
                <div className="w-20 h-20 bg-slate-100 shadow rounded-full max-sm:mx-auto" />
            )}
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <h3 className="break-words text-xl font-semibold text-slate-800"> {store.name || "Unnamed store"} </h3>
                <span className="break-all text-sm">@{store.username || "store"}</span>
                <span className={`rounded-full px-4 py-1 text-xs font-semibold ${statusClass}`}>
                    {store.status || "pending"}
                </span>
            </div>

            <p className="my-5 max-w-2xl break-words text-slate-600">{store.description || ""}</p>
            <p className="flex items-start gap-2 break-words"><MapPin size={16} className="mt-0.5 shrink-0" /> {store.address || "No address provided"}</p>
            <p className="flex items-center gap-2 break-all"><Phone size={16} className="shrink-0" /> {store.contact || "No phone provided"}</p>
            <p className="flex items-center gap-2 break-all"><Mail size={16} className="shrink-0" /> {store.email || "No email provided"}</p>
            <p className="text-slate-700 mt-5">Applied on <span className="text-xs">{new Date(store.createdAt).toLocaleDateString()}</span> by</p>
            <div className="flex min-w-0 items-center gap-2 text-sm">
                {store.user?.image ? (
                    <Image width={36} height={36} src={store.user.image} alt={store.user.name || "User"} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                    <div className="w-9 h-9 shrink-0 rounded-full bg-slate-100" />
                )}
                <div className="min-w-0">
                    <p className="truncate text-slate-600 font-medium">{store.user?.name || "User"}</p>
                    <p className="break-all text-slate-400">{store.user?.email || ""}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo
