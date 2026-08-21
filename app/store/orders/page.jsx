'use client'

import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const ORDER_STATUSES = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default function StoreOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '€'

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async () => {
        try {
            setLoading(true)

            const response = await fetch("/api/store/orders")
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
        const response = await fetch("/api/store/orders", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId, status }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update order status")
        }

        setOrders((prevOrders) =>
            prevOrders.map((order) => order.id === data.order.id ? data.order : order)
        )
        setSelectedOrder((currentOrder) =>
            currentOrder?.id === data.order.id ? data.order : currentOrder
        )

        return data.message
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Store <span className="text-slate-800 font-medium">Orders</span></h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {["Sr. No.", "Customer", "Total", "Payment", "Coupon", "Status", "Date"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="pl-6 text-green-600">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">{order.user?.name || "Customer"}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{currency}{order.total}</td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        {order.isCouponUsed ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                {order.coupon?.code || "Coupon"}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => toast.promise(updateOrderStatus(order.id, e.target.value), {
                                                loading: "Updating order...",
                                                success: (message) => message || "Order status updated",
                                                error: (error) => error.message || "Failed to update order status",
                                            })}
                                            className="border border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200"
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Order Details
                        </h2>

                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Customer Details</h3>
                            <p><span className="text-green-700">Name:</span> {selectedOrder.user?.name || "Customer"}</p>
                            <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email || "N/A"}</p>
                            <p><span className="text-green-700">Phone:</span> {selectedOrder.address?.phone || "N/A"}</p>
                            <p>
                                <span className="text-green-700">Address:</span>{" "}
                                {[selectedOrder.address?.street, selectedOrder.address?.city, selectedOrder.address?.state, selectedOrder.address?.zip, selectedOrder.address?.country].filter(Boolean).join(", ") || "N/A"}
                            </p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Products</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={`€ {item.productId}-€{i}`} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        {item.product?.images?.[0] && (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product?.name || "Product image"}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name || "Product"}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: {currency}{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p><span className="text-green-700">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                            <p><span className="text-green-700">Paid:</span> {selectedOrder.isPaid ? "Yes" : "No"}</p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">Coupon:</span> {selectedOrder.coupon?.code || "Coupon"} ({selectedOrder.coupon?.discount || 0}% off)</p>
                            )}
                            <p><span className="text-green-700">Status:</span> {selectedOrder.status}</p>
                            <p><span className="text-green-700">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
