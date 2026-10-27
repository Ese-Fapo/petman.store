import Link from 'next/link'
import { departments, categoryHref } from '@/lib/catalog'
export default function CategoriesMarquee() {
 return <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 py-5">{departments.map(item => <Link key={item.name} href={categoryHref(item.name)} className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-800">{item.name}</Link>)}</div>
}
