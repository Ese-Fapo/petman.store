'use client'

import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR'
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })
    const [error, setError] = useState("")

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch("/api/store/dashboard")
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch dashboard data")
            }

            setDashboardData({
                totalProducts: data.dashboardData?.totalProducts || 0,
                totalEarnings: data.dashboardData?.totalEarnings || 0,
                totalOrders: data.dashboardData?.totalOrders || 0,
                ratings: Array.isArray(data.dashboardData?.ratings) ? data.dashboardData.ratings : [],
            })
        } catch (error) {
            const message = error.message || "Failed to fetch dashboard data"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    if (error) {
        return (
            <div className="text-slate-500 mb-28">
                <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>
                <p className="mt-5 text-sm text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Seller dashboard summary metrics. */}
            <div className="my-10 mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardCardsData.map((card, index) => (
                    <div key={index} className="flex items-center justify-between gap-5 rounded-lg border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 text-xs">
                            <p>{card.title}</p>
                            <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                        </div>
                        <card.icon size={50} className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                    </div>
                ))}
            </div>

            <h2>Total Reviews</h2>

            <div className="mt-5">
                {dashboardData.ratings.map((review, index) => (
                    <div key={review.id || index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                        <div>
                            <div className="flex gap-3">
                                {review.user?.image ? (
                                    <Image src={review.user.image} alt={review.user?.name || "Customer"} className="w-10 aspect-square rounded-full" width={100} height={100} />
                                ) : (
                                    <div className="w-10 aspect-square rounded-full bg-slate-100" />
                                )}
                                <div>
                                    <p className="font-medium">{review.user?.name || "Customer"}</p>
                                    <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.review}</p>
                        </div>
                        <div className="flex flex-col justify-between gap-6 sm:items-end">
                            <div className="flex flex-col sm:items-end">
                                <p className="text-slate-400">{review.product?.category}</p>
                                <p className="font-medium">{review.product?.name}</p>
                                <div className="flex items-center">
                                    {Array(5).fill('').map((_, index) => (
                                        <StarIcon key={index} size={17} className="text-transparent mt-0.5" fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                            </div>
                            {review.product?.id && (
                                <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">View Product</button>
                            )}
                        </div>
                    </div>
                ))}
                {!dashboardData.ratings.length && (
                    <p className="text-sm text-slate-400">No reviews yet.</p>
                )}
            </div>
        </div>
    )
}
