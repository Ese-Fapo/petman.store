'use client'

import { CheckIcon, CopyIcon, TicketPercentIcon } from "lucide-react"
import { useState } from "react"

const formatExpiry = (expiresAt) => {
    const date = new Date(expiresAt)

    if (Number.isNaN(date.getTime())) {
        return "Limited time"
    }

    return `Ends ${date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })}`
}

const StoreCoupons = ({ coupons = [], onApply, compact = false }) => {
    const [copiedCode, setCopiedCode] = useState("")

    if (!coupons.length) {
        return null
    }

    const copyCode = async (code) => {
        await navigator.clipboard.writeText(code)
        setCopiedCode(code)
        window.setTimeout(() => setCopiedCode(""), 1600)
    }

    return (
        <div className={compact ? "space-y-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
            {coupons.map((coupon) => {
                const isCopied = copiedCode === coupon.code

                return (
                    <div key={coupon.code} className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-900">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <TicketPercentIcon size={16} className="shrink-0 text-green-700" />
                                    <p className="truncate font-semibold">{Number(coupon.discount || 0)}% off</p>
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-green-800">{coupon.description}</p>
                                {coupon.store?.name && (
                                    <p className="mt-1 truncate text-xs font-medium text-green-700">{coupon.store.name}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => copyCode(coupon.code)}
                                className="inline-flex shrink-0 items-center gap-1 rounded border border-green-200 bg-white px-2 py-1 text-xs font-semibold text-green-800 transition hover:bg-green-100"
                            >
                                {isCopied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                                {coupon.code}
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-green-700">{formatExpiry(coupon.expiresAt)}</p>
                            {onApply && (
                                <button
                                    type="button"
                                    onClick={() => onApply(coupon.code)}
                                    className="rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-800"
                                >
                                    Apply
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default StoreCoupons
