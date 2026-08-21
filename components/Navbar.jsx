'use client'

import {
    HomeIcon,
    LayoutDashboardIcon,
    LogOutIcon,
    MenuIcon,
    PackageIcon,
    PlusCircleIcon,
    Search,
    ShoppingBagIcon,
    ShoppingCart,
    ShoppingCartIcon,
    StoreIcon,
    XIcon,
} from "lucide-react"
import { SignInButton, useClerk, useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"

const Navbar = () => {
    const { user, isLoaded } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()

    const [search, setSearch] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)
    const [sellerStore, setSellerStore] = useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const isSeller = Boolean(sellerStore)

    const primaryLinks = useMemo(() => [
        { label: "Home", href: "/", icon: HomeIcon },
        { label: "Shop", href: "/shop", icon: ShoppingBagIcon },
        { label: "Pet Care Club", href: "/pricing", icon: PackageIcon },
    ], [])

    const roleLinks = useMemo(() => {
        if (!user) {
            return []
        }

        return [
            ...(isAdmin ? [{ label: "Admin Dashboard", href: "/admin", icon: LayoutDashboardIcon, highlight: true }] : []),
            ...(isAdmin ? [{ label: "Shops", href: "/admin/stores", icon: StoreIcon }] : []),
            ...(isSeller ? [{ label: sellerStore?.name || "Store Dashboard", href: "/store", icon: StoreIcon, highlight: !isAdmin }] : []),
            ...(isSeller ? [{ label: "Add Product", href: "/store/add-product", icon: PlusCircleIcon }] : []),
            ...(isSeller ? [{ label: "Store Orders", href: "/store/orders", icon: ShoppingBagIcon }] : []),
            ...(!isAdmin && !isSeller ? [{ label: "Become a Seller", href: "/create-store", icon: StoreIcon }] : []),
        ]
    }, [isAdmin, isSeller, sellerStore?.name, user])

    const handleSearch = (e) => {
        e.preventDefault()
        const query = search.trim()

        if (query) {
            setMobileMenuOpen(false)
            router.push(`/shop?search=${encodeURIComponent(query)}`)
        }
    }

    const handleSignOut = () => {
        setMobileMenuOpen(false)
        signOut({ redirectUrl: "/" })
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

    const renderNavLink = (link, className = "") => {
        const Icon = link.icon

        return (
            <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={className || `flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition hover:bg-green-50 hover:text-green-700 ${link.highlight ? "bg-green-50 text-green-700 font-medium" : "text-slate-600"}`}
            >
                <Icon size={18} />
                {link.label}
            </Link>
        )
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-16 items-center justify-between gap-3 lg:min-h-20">
                    <Link href="/" className="relative shrink-0 text-2xl font-semibold tracking-normal text-slate-800 sm:text-3xl">
                        JUST<span className="text-green-600">PETS</span><span className="text-green-600">.</span>
                        <span className="absolute -right-10 -top-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            plus
                        </span>
                    </Link>

                    <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
                        {[...primaryLinks, ...roleLinks.slice(0, 2)].map((link) => renderNavLink(link))}
                    </div>

                    <div className="hidden items-center gap-3 lg:flex">
                        <form onSubmit={handleSearch} className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm xl:flex xl:w-64">
                            <Search size={18} className="shrink-0 text-slate-500" />
                            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" type="text" placeholder="Search pet essentials" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-green-50 hover:text-green-700">
                            <ShoppingCart size={18} />
                            Cart
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] text-white">{cartCount}</span>
                        </Link>

                        {isLoaded && (
                            !user ? (
                                <SignInButton mode="modal">
                                    <button type="button" className="min-h-10 rounded-full bg-green-600 px-7 text-sm font-medium text-white transition hover:bg-green-700">
                                        Login
                                    </button>
                                </SignInButton>
                            ) : (
                                <UserButton>
                                    <UserButton.MenuItems>
                                        {roleLinks.map((link) => (
                                            <UserButton.Action key={link.href} labelIcon={<link.icon size={16} />} label={link.label} onClick={() => router.push(link.href)} />
                                        ))}
                                        <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My Orders" onClick={() => router.push('/orders')} />
                                    </UserButton.MenuItems>
                                </UserButton>
                            )
                        )}
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <Link href="/cart" aria-label="Cart" className="relative flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-green-50 hover:text-green-700">
                            <ShoppingCartIcon size={19} />
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-800 px-1 text-[10px] text-white">{cartCount}</span>
                        </Link>

                        {isLoaded && (
                            user ? (
                                <UserButton />
                            ) : (
                                <SignInButton mode="modal">
                                    <button type="button" className="min-h-10 rounded-full bg-green-600 px-4 text-sm font-medium text-white transition hover:bg-green-700">
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
                            className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white shadow-xl lg:hidden">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm">
                            <Search size={18} className="shrink-0 text-slate-500" />
                            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" type="text" placeholder="Search pet essentials" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <div className="mt-4 grid gap-2">
                            {[...primaryLinks, ...roleLinks].map((link) => renderNavLink(link, `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition hover:bg-green-50 hover:text-green-700 ${link.highlight ? "bg-green-50 text-green-700 font-medium" : "text-slate-600"}`))}

                            {user && (
                                <>
                                    <Link
                                        href="/orders"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-600 transition hover:bg-green-50 hover:text-green-700"
                                    >
                                        <PackageIcon size={19} />
                                        My Orders
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                        <LogOutIcon size={19} />
                                        Sign out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
