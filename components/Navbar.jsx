'use client'
import {
    HomeIcon,
    LayoutDashboardIcon,
    MenuIcon,
    PackageIcon,
    PlusCircleIcon,
    Search,
    ShoppingBagIcon,
    ShoppingCart,
    ShoppingCartIcon,
    StoreIcon,
    XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs"

const Navbar = () => {
    
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [search, setSearch] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [sellerStore, setSellerStore] = useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const isSeller = Boolean(sellerStore)

    const navLinks = [
        { label: "Home", href: "/", icon: HomeIcon },
        { label: "Shop", href: "/shop", icon: ShoppingBagIcon },
        ...(isSeller
            ? [{ label: "Seller Dashboard", href: "/store", icon: StoreIcon, highlight: true }]
            : user
                ? [{ label: "Become a Seller", href: "/create-store", icon: StoreIcon }]
                : []),
        { label: "Pet Care Club", href: "/pricing", icon: PackageIcon },
    ]

    const handleSearch = (e) => {
        e.preventDefault()
        const query = search.trim()

        if (query) {
            setMobileMenuOpen(false)
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
        if (!isLoaded) {
            return
        }

        checkIsAdmin()
        checkIsSeller()
    }, [isLoaded, user])

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [user])

    return (
        <nav className="relative z-30 bg-white">
            <div className="mx-4 sm:mx-6">
                <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative z-20 shrink-0 text-3xl sm:text-4xl font-semibold tracking-normal text-slate-800">
                        JUST<span className="text-green-600">PETS</span><span className="text-green-600 text-5xl leading-0">.</span>
                        <span className="absolute pointer-events-none text-xs font-semibold -top-1 -right-12 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-600">
                            c
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-5 xl:gap-8 text-slate-600">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-1.5 whitespace-nowrap hover:text-green-700 transition ${link.highlight ? "text-green-700 font-medium" : ""}`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        ))}

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-64 text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600 shrink-0" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search pet essentials" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 hover:text-green-700 transition">
                            <ShoppingCart size={18} />
                            Cart
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                        </Link>
                        {isLoaded && (
                            !user ? (
                                <SignInButton mode="modal">
                                    <button type="button" className="relative z-20 min-h-10 px-8 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-full">
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
                        )}
                    </div>

                    {/* Tablet and Mobile Controls */}
                    <div className="relative z-20 flex items-center gap-2 lg:hidden">
                        <Link href="/cart" aria-label="Cart" className="relative flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <ShoppingCartIcon size={19} />
                            <span className="absolute -top-0.5 -right-0.5 text-[10px] text-white bg-slate-700 min-w-4 h-4 px-1 rounded-full flex items-center justify-center">{cartCount}</span>
                        </Link>

                        {isLoaded && (
                            user ? (
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
                            ) : (
                                <SignInButton mode="modal">
                                    <button type="button" className="min-h-10 px-5 py-2 bg-green-600 hover:bg-green-700 text-sm transition text-white rounded-full">
                                        Login
                                    </button>
                                </SignInButton>
                            )
                        )}

                        <button
                            type="button"
                            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                        >
                            {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-40 border-y border-slate-200 bg-white shadow-lg lg:hidden">
                    <div className="mx-4 sm:mx-6 py-4">
                        <form onSubmit={handleSearch} className="flex items-center text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600 shrink-0" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search pet essentials" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <div className="mt-4 grid gap-2 text-slate-600">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex min-h-11 items-center gap-3 rounded-md px-3 transition hover:bg-slate-50 ${link.highlight ? "text-green-700 font-medium" : ""}`}
                                >
                                    <link.icon size={19} />
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/orders"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex min-h-11 items-center gap-3 rounded-md px-3 transition hover:bg-slate-50"
                            >
                                <PackageIcon size={19} />
                                My Orders
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
