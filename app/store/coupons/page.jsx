'use client'

import Loading from "@/components/Loading"
import { format } from "date-fns"
import { DeleteIcon } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const defaultCoupon = {
    code: "",
    description: "",
    discount: "",
    isPublic: true,
    expiresAt: format(new Date(), "yyyy-MM-dd"),
}

export default function StoreCoupons() {
    const [coupons, setCoupons] = useState([])
    const [couponDraft, setCouponDraft] = useState(defaultCoupon)
    const [loading, setLoading] = useState(true)

    const fetchCoupons = async () => {
        try {
            setLoading(true)

            // The API returns coupons for the current seller's store only.
            const response = await fetch("/api/store/coupons")
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch coupons")
            }

            setCoupons(Array.isArray(data.coupons) ? data.coupons : [])
        } catch (error) {
            toast.error(error.message || "Failed to fetch coupons")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {
        setCouponDraft((currentCoupon) => ({
            ...currentCoupon,
            [event.target.name]: event.target.value,
        }))
    }

    const createCoupon = async (event) => {
        event.preventDefault()

        // Store ownership is enforced by the API, not by this form.
        const response = await fetch("/api/store/coupons", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ coupon: couponDraft }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to create coupon")
        }

        setCoupons((currentCoupons) => [data.coupon, ...currentCoupons])
        setCouponDraft(defaultCoupon)

        return data.message
    }

    const deleteCoupon = async (code) => {
        const response = await fetch(`/api/store/coupons?code=${encodeURIComponent(code)}`, {
            method: "DELETE",
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete coupon")
        }

        setCoupons((currentCoupons) => currentCoupons.filter((coupon) => coupon.code !== code))

        return data.message
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="mb-28 text-slate-500">
            <h1 className="text-2xl">Store <span className="font-medium text-slate-800">Coupons</span></h1>

            <form onSubmit={(event) => toast.promise(createCoupon(event), {
                loading: "Creating coupon...",
                success: (message) => message || "Coupon created successfully",
                error: (error) => error.message || "Failed to create coupon",
            })} className="mt-5 max-w-xl rounded-lg border border-slate-200 bg-white p-5 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                    <input
                        type="text"
                        name="code"
                        value={couponDraft.code}
                        onChange={handleChange}
                        placeholder="Coupon Code"
                        className="rounded border border-slate-200 p-2 outline-slate-400"
                        required
                    />
                    <input
                        type="number"
                        name="discount"
                        value={couponDraft.discount}
                        onChange={handleChange}
                        min={1}
                        max={100}
                        placeholder="Discount (%)"
                        className="rounded border border-slate-200 p-2 outline-slate-400"
                        required
                    />
                </div>
                <input
                    type="text"
                    name="description"
                    value={couponDraft.description}
                    onChange={handleChange}
                    placeholder="Coupon Description"
                    className="mt-3 w-full rounded border border-slate-200 p-2 outline-slate-400"
                    required
                />
                <label className="mt-3 block">
                    <span>Expiry Date</span>
                    <input
                        type="date"
                        name="expiresAt"
                        value={couponDraft.expiresAt}
                        onChange={handleChange}
                        className="mt-1 w-full rounded border border-slate-200 p-2 outline-slate-400"
                        required
                    />
                </label>
                <div className="mt-4 flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center text-gray-900">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={couponDraft.isPublic}
                            onChange={(event) => setCouponDraft((currentCoupon) => ({
                                ...currentCoupon,
                                isPublic: event.target.checked,
                            }))}
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-green-600"></div>
                        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                    <p>Public coupon</p>
                </div>
                <button className="mt-5 rounded bg-slate-700 px-8 py-2 text-white transition active:scale-95">
                    Create Coupon
                </button>
            </form>

            <div className="mt-10 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            {["Code", "Description", "Discount", "Expires At", "Public", "Action"].map((heading) => (
                                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {coupons.length ? coupons.map((coupon) => (
                            <tr key={coupon.code} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{coupon.code}</td>
                                <td className="px-4 py-3 text-slate-800">{coupon.description}</td>
                                <td className="px-4 py-3 text-slate-800">{coupon.discount}%</td>
                                <td className="px-4 py-3 text-slate-800">{format(new Date(coupon.expiresAt), "yyyy-MM-dd")}</td>
                                <td className="px-4 py-3 text-slate-800">{coupon.isPublic ? "Yes" : "No"}</td>
                                <td className="px-4 py-3">
                                    <DeleteIcon
                                        onClick={() => toast.promise(deleteCoupon(coupon.code), {
                                            loading: "Deleting coupon...",
                                            success: (message) => message || "Coupon deleted successfully",
                                            error: (error) => error.message || "Failed to delete coupon",
                                        })}
                                        className="h-5 w-5 cursor-pointer text-red-500 hover:text-red-800"
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No coupons yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
