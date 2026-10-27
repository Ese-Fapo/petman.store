'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Sofa, CookingPot, Flower2, BedDouble, Refrigerator, SprayCan, Boxes, Lamp, Headphones, Laptop, Smartphone, Wifi, Sprout, Drill, Hammer, Fan, ShoppingBasket, Sparkles, HeartPulse, Baby, Puzzle, Dumbbell, Briefcase, Car, ArrowRight, ChevronDown } from 'lucide-react'
import { departments, categoryHref } from '@/lib/catalog'
const icons = { Sofa, CookingPot, Flower2, BedDouble, Refrigerator, SprayCan, Boxes, Lamp, Headphones, Laptop, Smartphone, Wifi, Sprout, Drill, Hammer, Fan, ShoppingBasket, Sparkles, HeartPulse, Baby, Puzzle, Dumbbell, Briefcase, Car }
const colors = ['bg-[#edf0e8]', 'bg-[#f8eee1]', 'bg-[#f3e9e9]', 'bg-[#e8edf3]', 'bg-[#eeebf4]', 'bg-[#e7efeb]']
export default function CategoryDirectory() {
  const [expanded, setExpanded] = useState(false)
  return <section id="categories" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6">
    <div className="mb-7 flex items-end justify-between gap-3"><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">Find your everyday</p><h2 className="text-3xl font-medium tracking-tight text-slate-900">Shop by category</h2></div><Link href="/shop" className="flex items-center gap-2 text-sm text-emerald-800">Shop all <ArrowRight size={17} /></Link></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{departments.slice(0, expanded ? departments.length : 12).map((department, index) => {
      const Icon = icons[department.icon]
      return <Link key={department.name} href={categoryHref(department.name)} className={`group flex min-h-36 flex-col items-center justify-center gap-4 rounded-2xl p-4 text-center transition hover:-translate-y-1 hover:shadow-md ${colors[index % colors.length]}`}><Icon size={32} strokeWidth={1.35} className="text-[#315346]" /><span className="text-sm font-medium text-slate-800">{department.name}</span></Link>
    })}</div>
    <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="mx-auto mt-6 flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50">{expanded ? 'Show fewer categories' : 'Explore all 24 departments'}<ChevronDown size={16} className={expanded ? 'rotate-180' : ''} /></button>
  </section>
}
