'use client'

import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const ORDER_STATUSES = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default function AdminOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR'

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            setLoading(true)

            // Admin order data is loaded from the protected API, not from client-side filters.
            const response = await fetch("/api/admin/orders")
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch orders")
            }

            setOrders(Array.isArray(data.orders) ? data.orders : [])
        } catch (error) {
            toast.error(error.message || "Failed to fetch orders")
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        // The API re-checks admin access before mutating any order status.
        const response = await fetch("/api/admin/orders", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, status }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update order")
        }

        setOrders((currentOrders) =>
            currentOrders.map((order) => order.id === data.order.id ? data.order : order)
        )

        return data.message
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Platform <span className="font-medium text-slate-800">Orders</span></h1>

            {orders.length ? (
                <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full min-w-[960px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                            <tr>
                                {["Order", "Customer", "Store", "Items", "Total", "Payment", "Status", "Date"].map((heading) => (
                                    <th key={heading} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="align-top">
                                    <td className="px-4 py-4 font-medium text-slate-800">{order.id.slice(-8).toUpperCase()}</td>
                                    <td className="px-4 py-4">
                                        <p className="font-medium text-slate-700">{order.user?.name || "Customer"}</p>
                                        <p className="text-xs">{order.user?.email || "No email"}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-medium text-slate-700">{order.store?.name || "Store"}</p>
                                        {order.store?.username && <p className="text-xs">@{order.store.username}</p>}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            {(order.orderItems || []).map((item) => (
                                                <p key={`${order.id}-${item.productId}`} className="max-w-64 truncate">
                                                    {item.quantity}x {item.product?.name || "Product"}
                                                </p>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-slate-800">{currency}{Number(order.total || 0).toFixed(2)}</td>
                                    <td className="px-4 py-4">
                                        <p>{order.paymentMethod}</p>
                                        <p className="text-xs">{order.isPaid ? "Paid" : "Unpaid"}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(event) => toast.promise(updateOrderStatus(order.id, event.target.value), {
                                                loading: "Updating order...",
                                                success: (message) => message || "Order updated",
                                                error: (error) => error.message || "Failed to update order",
                                            })}
                                            className="rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-green-500"
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-4">{new Date(order.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex h-80 items-center justify-center">
                    <h2 className="text-3xl font-medium text-slate-400">No orders yet</h2>
                </div>
            )}
        </div>
    )
}
