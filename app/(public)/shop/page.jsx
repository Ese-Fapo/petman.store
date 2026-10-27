'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { departments, filterProducts } from '@/lib/catalog'

function ShopContent() {
  const params = useSearchParams()
  const router = useRouter()
  const search = params.get('search') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'
  const [showFilters, setShowFilters] = useState(false)
  const { list: products, loading, error } = useSelector(state => state.product)
  const filtered = filterProducts(products, { search, category, sort })
  const update = (key, value) => { const next = new URLSearchParams(params.toString()); value ? next.set(key, value) : next.delete(key); router.push(`/shop${next.size ? `?${next}` : ''}`) }
  return <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-9 sm:px-6">
    <p className="text-xs text-slate-500"><Link href="/">Home</Link> / Marketplace{category && ` / ${category}`}</p>
    <div className="my-6"><h1 className="text-3xl font-medium tracking-tight text-slate-900">{category || 'Explore the marketplace'}</h1><p className="mt-2 text-sm text-slate-500">{search ? `Search results for ?${search}?` : 'Everyday essentials and new discoveries from independent sellers.'}</p></div>
    <form key={search} onSubmit={e => {e.preventDefault(); update('search', new FormData(e.currentTarget).get('search').trim())}} className="mb-6 flex max-w-2xl gap-3 rounded-xl border border-slate-200 p-2 pl-4"><Search size={20} className="my-auto text-slate-400"/><input aria-label="Search marketplace" name="search" defaultValue={search} placeholder="Search products, categories, or stores" className="min-w-0 flex-1 text-sm outline-none"/><button className="rounded-lg bg-[#173d32] px-5 py-2.5 text-sm text-white">Search</button></form>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-4"><p className="text-sm text-slate-500" aria-live="polite">{loading ? 'Loading products?' : `${filtered.length} products`}</p><div className="flex items-center gap-3"><button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} className="flex items-center gap-2 text-sm lg:hidden"><SlidersHorizontal size={16}/> Categories</button><select aria-label="Sort products" value={sort} onChange={e => update('sort',e.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm"><option value="newest">Newest arrivals</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
    <div className="grid items-start gap-8 lg:grid-cols-[235px_1fr]">
      <aside className={`${showFilters ? 'block' : 'hidden'} rounded-xl border border-slate-200 p-4 lg:block`}><h2 className="mb-4 font-medium text-slate-900">All departments</h2><button onClick={() => update('category','')} className={`mb-3 text-left text-sm ${!category ? 'font-semibold text-emerald-800' : 'text-slate-500'}`}>All products</button>{departments.map(department => <details key={department.name} open={category === department.name || department.categories.includes(category)} className="border-t border-slate-100 py-2"><summary className="cursor-pointer text-sm text-slate-700">{department.name}</summary><div className="flex flex-col items-start gap-2 py-3 pl-3">{[department.name,...department.categories].map(name => <button key={name} onClick={() => update('category',name)} className={`text-left text-xs ${category === name ? 'font-semibold text-emerald-800' : 'text-slate-500 hover:text-emerald-800'}`}>{name === department.name ? `All ${name}` : name}</button>)}</div></details>)}</aside>
      <div>{(category || search) && <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">{category && <button onClick={() => update('category','')} className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-800">{category} ?</button>}{search && <button onClick={() => update('search','')} className="rounded-full bg-slate-100 px-3 py-2">{search} ?</button>}<Link href="/shop" className="px-2 text-slate-500 underline">Clear filters</Link></div>}
      {loading ? <p className="py-12 text-sm text-slate-500">Loading products?</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : filtered.length ? <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">{filtered.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <div className="rounded-2xl bg-slate-50 px-6 py-20 text-center"><PackageOpen size={42} strokeWidth={1.25} className="mx-auto text-slate-400"/><h2 className="mt-4 text-xl text-slate-800">No products here yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">Try another category or search. Have something to sell? Bring your products to the marketplace.</p><Link href="/create-store" className="mt-5 inline-block rounded-full bg-[#173d32] px-5 py-3 text-sm text-white">Open your store</Link></div>}</div>
    </div>
  </main>
}
export default function Shop() { return <Suspense fallback={<div className="p-10">Loading marketplace?</div>}><ShopContent/></Suspense> }
