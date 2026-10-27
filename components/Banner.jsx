import Link from 'next/link'
export default function Banner() {
  return <div className="bg-[#173d32] px-4 py-2.5 text-center text-xs text-white sm:text-sm">Everything for your everyday. <span className="text-emerald-200">Discover more on shopSmart.</span> <Link href="/shop" className="ml-3 underline underline-offset-4">Start exploring &rarr;</Link></div>
}
