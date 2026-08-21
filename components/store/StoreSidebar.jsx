'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const StoreSidebar = ({ storeInfo }) => {

    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    return (
        <aside className="shrink-0 border-slate-200 bg-white max-sm:sticky max-sm:top-0 max-sm:z-30 max-sm:border-b sm:h-full sm:min-w-60 sm:border-r">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                {storeInfo?.logo ? (
                    <Image className="w-14 h-14 rounded-full shadow-md object-cover" src={storeInfo.logo} alt={storeInfo.name || "Store logo"} width={80} height={80} />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 shadow-md" />
                )}
                <p className="max-w-48 truncate text-slate-700">{storeInfo?.name || "Store"}</p>
            </div>

            <nav className="flex overflow-x-auto no-scrollbar sm:mt-5 sm:block">
                {sidebarLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={`relative flex min-w-20 flex-col items-center justify-center gap-1 px-3 py-3 text-xs text-slate-500 transition hover:bg-slate-50 sm:min-w-0 sm:flex-row sm:justify-start sm:gap-3 sm:p-2.5 sm:text-sm ${pathname === link.href ? 'bg-slate-100 text-slate-700' : ''}`}
                    >
                        <link.icon size={18} className="sm:ml-5" />
                        <span className="whitespace-nowrap">{link.name}</span>
                        {pathname === link.href && <span className="absolute bg-green-500 bottom-0 left-3 right-3 h-1 rounded-t sm:left-auto sm:right-0 sm:top-1.5 sm:bottom-1.5 sm:h-auto sm:w-1.5 sm:rounded-l"></span>}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}

export default StoreSidebar
