'use client'
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"

const StoreNavbar = () => {

    const { user } = useUser()


    return (
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 transition-all sm:px-6 lg:px-12">
            <Link href="/" className="relative shrink-0 text-2xl font-semibold text-slate-800 sm:text-4xl">
                JUST<span className="text-green-600">PETS</span><span className="text-green-600 sm:text-5xl leading-0">.</span>
                <p className="absolute -right-10 -top-1 flex items-center gap-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white sm:-right-11 sm:px-3 sm:text-xs">
                    Store
                </p>
            </Link>
            <div className="flex min-w-0 items-center gap-3">
                <p className="truncate text-sm text-slate-600 max-[360px]:hidden">Hi, {user?.firstName || "Seller"}</p>
                <UserButton />
            </div>
        </div>
    )
}

export default StoreNavbar
