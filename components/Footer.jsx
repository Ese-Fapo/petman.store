import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { categoryHref } from '@/lib/catalog'
const groups = [
 {title:'Explore',links:[['Furniture',categoryHref('Furniture')],['Kitchen & Dining',categoryHref('Kitchen & Dining')],['Electronics',categoryHref('Electronics')],['Garden & Outdoor',categoryHref('Garden & Outdoor')],['All categories','/#categories']]},
 {title:'Your shopSmart',links:[['Marketplace','/shop'],['Your cart','/cart'],['Your orders','/orders'],['shopSmart Plus','/pricing']]},
 {title:'For sellers',links:[['Become a seller','/create-store'],['Seller dashboard','/store'],['Manage products','/store/manage-product'],['Seller orders','/store/orders']]}
]
export default function Footer() {
 return <footer className="mt-16 border-t border-slate-200 bg-[#f7f8f5] px-4 text-slate-600 sm:px-6"><div className="mx-auto max-w-7xl"><div className="grid gap-10 py-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]"><div><Link href="/" className="text-3xl font-semibold tracking-tight text-slate-900">shop<span className="text-green-600">Smart</span>.</Link><p className="mt-4 max-w-xs text-sm leading-relaxed">Everything for your everyday. Discover home essentials, fresh ideas, and independent stores in one marketplace.</p><Link href="/create-store" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800">Grow with shopSmart <ArrowUpRight size={16}/></Link></div>{groups.map(group => <div key={group.title}><h3 className="mb-4 text-sm font-medium text-slate-900">{group.title}</h3><ul className="space-y-3 text-sm">{group.links.map(([label,href]) => <li key={label}><Link href={href} className="hover:text-emerald-800">{label}</Link></li>)}</ul></div>)}</div><div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 py-5 text-xs"><p>? {new Date().getFullYear()} shopSmart. All rights reserved.</p><p>Many stores. One smart place to shop.</p></div></div></footer>
}
