import Link from 'next/link'
import { ArrowRight, Store } from 'lucide-react'
export default function Newsletter() {
 return <section className="mx-auto my-16 max-w-7xl px-4 sm:px-6"><div className="flex flex-col items-start justify-between gap-7 rounded-3xl bg-[#edf0e8] p-8 sm:flex-row sm:items-center sm:p-12"><div><Store className="mb-4 text-emerald-800" size={28} /><h2 className="text-3xl font-medium text-[#173d32]">Small businesses. Big possibilities.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">Bring your store to shopSmart. List your products, manage your orders, and make your next connection with a new customer.</p></div><Link href="/create-store" className="inline-flex shrink-0 items-center gap-4 rounded-full bg-[#173d32] px-6 py-3.5 text-sm text-white hover:bg-emerald-800">Become a seller <ArrowRight size={17} /></Link></div></section>
}
