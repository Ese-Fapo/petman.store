import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Store, PackageCheck, Layers3 } from 'lucide-react'

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#eae8df]">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85" alt="A living room with neutral sofas, lighting and natural wood" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" fetchPriority="high" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#eeeee6] via-[#eeeee6]/95 to-[#eeeee6]/5" />
          <div className="max-w-xl px-7 py-12 sm:px-12 sm:py-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-emerald-900"><span className="size-1.5 rounded-full bg-emerald-700" /> MANY STORES. ENDLESS POSSIBILITIES.</span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-tight text-[#173d32] sm:text-6xl">A little of everything.<br /><span className="text-emerald-700">A lot to love.</span></h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-600">From everyday essentials to your next great find. Shop for your home, your family, and everything in between.</p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-5 rounded-full bg-[#173d32] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-emerald-800">Explore the marketplace <ArrowRight size={18} /></Link>
            <p className="mt-8 flex items-center gap-2 text-xs text-slate-600"><Layers3 size={16} /> 24 departments. One place to discover them all.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link href="/shop?category=Kitchen%20%26%20Dining" className="group relative min-h-52 overflow-hidden rounded-3xl bg-[#f1e7db] p-6">
            <img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=650&q=80" alt="Kitchen workspace and cooking essentials" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/5" />
            <div className="relative flex h-full min-h-40 flex-col justify-end text-white"><p className="text-xs uppercase tracking-widest text-white/80">Made for everyday</p><h2 className="mt-2 text-2xl font-medium">Good things<br />start at home.</h2><span className="mt-3 inline-flex items-center gap-2 text-sm">Shop kitchen & dining <ArrowUpRight size={17} /></span></div>
          </Link>
          <Link href="/create-store" className="group flex min-h-52 flex-col justify-between rounded-3xl bg-[#f3dba6] p-6 text-[#473818]">
            <div className="flex items-center justify-between"><Store size={27} strokeWidth={1.5} /><ArrowUpRight size={22} /></div>
            <div className="mt-5"><p className="text-xs uppercase tracking-widest">For independent sellers</p><h2 className="mt-2 text-2xl font-medium leading-tight">Your products.<br />Their next favorite.</h2><p className="mt-3 text-sm">Open your shop on shopSmart</p></div>
          </Link>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-4 border-b border-slate-200 py-5 text-xs text-slate-600 sm:text-sm"><span className="flex items-center gap-2"><Store size={18} /> Discover independent stores</span><span className="flex items-center gap-2"><Layers3 size={18} /> More choice for every room</span><span className="flex items-center gap-2"><PackageCheck size={18} /> Your essentials, all together</span></div>
    </section>
  )
}
