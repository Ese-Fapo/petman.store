'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const statusClass = (status) => {
    if (status === "DELIVERED") return "text-green-500 bg-green-100";
    if (status === "SHIPPED") return "text-blue-500 bg-blue-100";
    if (status === "PROCESSING" || status === "ORDER_PLACED") return "text-yellow-600 bg-yellow-100";
    return "text-slate-500 bg-slate-100";
}

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => {
                            const product = item.product || {};
                            const existingRating = ratings.find(rating => order.id === rating.orderId && product.id === rating.productId);

                            return (
                                <div key={item.id || index} className="flex items-center gap-4">
                                    <div className="flex w-20 shrink-0 aspect-square items-center justify-center rounded-md bg-slate-100">
                                        {product.images?.[0] && (
                                            <Image
                                                className="h-14 w-auto object-contain"
                                                src={product.images[0]}
                                                alt={product.name || "Product image"}
                                                width={50}
                                                height={50}
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex flex-col justify-center text-sm">
                                        <p className="break-words text-base font-medium text-slate-600">{product.name || "Product"}</p>
                                        <p>{currency}{item.price} Qty: {item.quantity}</p>
                                        <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                        <div>
                                            {existingRating
                                                ? <Rating value={existingRating.rating} />
                                                : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRatingModal({ orderId: order.id, productId: product.id })}
                                                        className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" || !product.id ? 'hidden' : ''}`}
                                                    >
                                                        Rate Product
                                                    </button>
                                                )
                                            }
                                        </div>
                                        {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <p>{order.address?.name}, {order.address?.street},</p>
                    <p>{order.address?.city}, {order.address?.state}, {order.address?.zip}, {order.address?.country},</p>
                    <p>{order.address?.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div className={`flex items-center justify-center gap-1 rounded-full p-1 ${statusClass(order.status)}`}>
                        <DotIcon size={10} className="scale-250" />
                        {order.status?.split('_').join(' ').toLowerCase() || "pending"}
                    </div>
                </td>
            </tr>
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p>{order.address?.name}, {order.address?.street}</p>
                    <p>{order.address?.city}, {order.address?.state}, {order.address?.zip}, {order.address?.country}</p>
                    <p>{order.address?.phone}</p>
                    <br />
                    <div className="flex items-center">
                        <span className={`mx-auto rounded-full px-6 py-1.5 text-center ${statusClass(order.status)}`}>
                            {order.status?.replace(/_/g, ' ').toLowerCase() || "pending"}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem
