'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR'

    return (
        <div className='mx-6 xl:mx-10'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10 xl:my-12 xl:grid xl:grid-cols-[minmax(0,1fr)_350px] xl:items-stretch xl:gap-6'>
                <div className='relative flex-1 flex flex-col overflow-hidden bg-green-100 rounded-3xl xl:min-h-[540px] xl:bg-[#f3f8ed] xl:rounded-[2rem] xl:border xl:border-emerald-900/10 xl:shadow-[0_24px_70px_rgba(15,23,42,0.10)] group'>
                    <div className='p-5 sm:p-16 xl:relative xl:z-10 xl:max-w-[560px] xl:p-12 xl:pr-0'>
                        <div className='inline-flex items-center gap-3 bg-white/80 text-green-700 pr-4 p-1 rounded-full text-xs sm:text-sm xl:bg-emerald-950 xl:text-white xl:shadow-sm'>
                            <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs xl:bg-orange-400 xl:text-slate-950 xl:font-semibold'>KEDEL</span> Fast  delivery on all orders   <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium text-slate-800 max-w-xs sm:max-w-md xl:max-w-xl xl:text-6xl xl:leading-[1.04] xl:my-6 xl:tracking-normal'>
                            Pet food, toys and care for Ireland's best-loved companions.
                        </h2>
                        <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8 xl:flex xl:items-end xl:gap-3 xl:mt-7'>
                            <p>Starts from</p>
                            <p className='text-3xl xl:text-5xl'>{currency}8</p>
                        </div>
                        <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition xl:mt-9 xl:inline-flex xl:items-center xl:gap-3 xl:bg-orange-500 xl:px-9 xl:py-4 xl:text-slate-950 xl:font-semibold xl:hover:bg-orange-400'>SHOP NOW <ArrowRightIcon className='hidden xl:block' size={18} /></button>
                        <div className='hidden xl:flex xl:items-center xl:gap-8 xl:mt-12 xl:text-sm xl:text-slate-700'>
                            <div>
                                <p className='text-2xl font-semibold text-slate-950'>2K+</p>
                                <p>happy customers</p>
                            </div>
                            <div className='h-10 w-px bg-slate-300' />
                            <div>
                                <p className='text-2xl font-semibold text-slate-950'>24h</p>
                                <p>fast dispatch</p>
                            </div>
                            <div className='h-10 w-px bg-slate-300' />
                            <div>
                                <p className='text-2xl font-semibold text-slate-950'>4.9</p>
                                <p>care rating</p>
                            </div>
                        </div>
                    </div>
                    <div className='hidden xl:block absolute inset-y-8 right-8 w-[44%] overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-2xl'>
                        <Image className='h-full w-full object-cover object-center opacity-95 transition duration-500 group-hover:scale-105' src={assets.hero_model_img} alt="Cat resting beside pet shop supplies" />
                    </div>
                    <Image className='sm:absolute bottom-0 right-0 md:right-6 w-full sm:max-w-md h-72 sm:h-full object-cover object-center xl:hidden' src={assets.hero_model_img} alt="Cat resting beside pet shop supplies" />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-none xl:gap-6 text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 xl:relative xl:min-h-[257px] xl:overflow-hidden xl:bg-slate-950 xl:text-slate-300 xl:p-8 xl:rounded-[1.75rem] group'>
                        <div>
                            <p className='text-3xl font-medium text-slate-800 max-w-40 xl:text-white xl:max-w-44'>Toys they will chase</p>
                            <p className='flex items-center gap-1 mt-4 xl:text-orange-300'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35 xl:absolute xl:-right-3 xl:bottom-3 xl:w-40 xl:rotate-[-8deg]' src={assets.hero_product_img1} alt="Dog toy" />
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 xl:relative xl:min-h-[257px] xl:overflow-hidden xl:bg-[#dcebf7] xl:p-8 xl:rounded-[1.75rem] xl:border xl:border-sky-900/10 group'>
                        <div>
                            <p className='text-3xl font-medium text-slate-800 max-w-40 xl:max-w-48'>20% off first orders</p>
                            <p className='flex items-center gap-1 mt-4 xl:text-sky-800'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35 xl:absolute xl:-right-4 xl:bottom-2 xl:w-44' src={assets.hero_product_img2} alt="Pet food" />
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero
