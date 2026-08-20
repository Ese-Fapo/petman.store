'use client'
import { LayoutDashboardIcon, PackageIcon, PlusCircleIcon, Search, ShoppingBagIcon, ShoppingCart, ShoppingCartIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs"

const Navbar = () => {
    
    const { user } = useUser();

    const router = useRouter();

    const [search, setSearch] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [sellerStore, setSellerStore] = useState(null)
    const cartCount = useSelector(state => state.cart.total)
    const isSeller = Boolean(sellerStore)

    const handleSearch = (e) => {
        e.preventDefault()
        const query = search.trim()

        if (query) {
            router.push(`/shop?search=${encodeURIComponent(query)}`)
        }
    }

    const checkIsAdmin = async () => {
        if (!user) {
            setIsAdmin(false)
            return
        }

        try {
            const response = await fetch("/api/admin/is-admin")
            setIsAdmin(response.ok)
        } catch {
            setIsAdmin(false)
        }
    }

    const checkIsSeller = async () => {
        if (!user) {
            setSellerStore(null)
            return
        }

        try {
            const response = await fetch("/api/store/is-seller")
            const data = await response.json()
            setSellerStore(response.ok && data.isSeller ? data.storeInfo : null)
        } catch {
            setSellerStore(null)
        }
    }

    useEffect(() => {
        checkIsAdmin()
        checkIsSeller()
    }, [user])

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-3xl sm:text-4xl font-semibold tracking-normal text-slate-800">
                        JUST<span className="text-green-600">PETS</span><span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute pointer-events-none text-xs font-semibold -top-1 -right-12 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-600">
                            c
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        {isSeller ? (
                            <Link href="/store" className="flex items-center gap-1.5 text-green-700 font-medium">
                                <StoreIcon size={18} />
                                Seller
                            </Link>
                        ) : user ? (
                            <Link href="/create-store" className="flex items-center gap-1.5">
                                <StoreIcon size={18} />
                                Sell
                            </Link>
                        ) : null}
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search pet essentials" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        {
                            !user ? (
                                <SignInButton mode="modal">
                                    <button type="button" className="px-8 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-full">
                                        Login
                                    </button>
                                </SignInButton>
                            ) : (
                                <UserButton>
                                    <UserButton.MenuItems>
                                        {isAdmin && (
                                            <UserButton.Action labelIcon={<LayoutDashboardIcon size={16} />} label="Admin Dashboard" onClick={() =>
                                                router.push('/admin')} />
                                        )}
                                        {isSeller && (
                                            <UserButton.Action labelIcon={<StoreIcon size={16} />} label={sellerStore?.name || "Store Dashboard"} onClick={() =>
                                                router.push('/store')} />
                                        )}
                                        {isSeller && (
                                            <UserButton.Action labelIcon={<PlusCircleIcon size={16} />} label="Add Product" onClick={() =>
                                                router.push('/store/add-product')} />
                                        )}
                                        {isSeller && (
                                            <UserButton.Action labelIcon={<ShoppingBagIcon size={16} />} label="Store Orders" onClick={() =>
                                                router.push('/store/orders')} />
                                        )}
                                        {!isSeller && (
                                            <UserButton.Action labelIcon={<StoreIcon size={16} />} label="Become a Seller" onClick={() =>
                                                router.push('/create-store')} />
                                        )}
                                        <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My Orders" onClick={() =>
                                            router.push('/orders')} />
                                    </UserButton.MenuItems>
                                </UserButton>
                            )
                        }
                    </div>

                    {/* Mobile User Button  */}
                    <div className="relative z-10 shrink-0 sm:hidden">
                        {user ? (
                            <div>
                                <UserButton>
                                    <UserButton.MenuItems>
                                        {isAdmin && (
                                            <UserButton.Action labelIcon={<LayoutDashboardIcon size={16} />} label="Admin Dashboard" onClick={() =>
                                                router.push('/admin')} />
                                        )}
                                        {isSeller && (
                                            <UserButton.Action labelIcon={<StoreIcon size={16} />} label={sellerStore?.name || "Store Dashboard"} onClick={() =>
                                                router.push('/store')} />
                                        )}
                                        {isSeller && (
                                            <UserButton.Action labelIcon={<PlusCircleIcon size={16} />} label="Add Product" onClick={() =>
                                                router.push('/store/add-product')} />
                                        )}
                                        {isSeller && (
                                            <UserButton.Action labelIcon={<ShoppingBagIcon size={16} />} label="Store Orders" onClick={() =>
                                                router.push('/store/orders')} />
                                        )}
                                        {!isSeller && (
                                            <UserButton.Action labelIcon={<StoreIcon size={16} />} label="Become a Seller" onClick={() =>
                                                router.push('/create-store')} />
                                        )}
                                        <UserButton.Action labelIcon={<ShoppingCartIcon size={16} />} label="Cart" onClick={() =>
                                            router.push('/cart')} />
                                        <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My Orders" onClick={() =>
                                            router.push('/orders')} />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        ) : (
                            <SignInButton mode="modal">
                                <button type="button" className="px-7 py-1.5 bg-green-600 hover:bg-green-700 text-sm transition text-white rounded-full">
                                    Login
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
