'use client'

import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR'
    const ratings = Array.isArray(product.rating) ? product.rating : []
    const image = Array.isArray(product.images) ? product.images[0] : null

    // Calculate the average rating of the product.
    const rating = ratings.length
        ? Math.round(ratings.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) / ratings.length)
        : 0

    return (
        <Link href={`/product/${product.id}`} className=' group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                {image ? (
                    <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300' src={image} alt={product.name || "Product image"} />
                ) : (
                    <div className='text-sm text-slate-400'>No image</div>
                )}
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name || "Unnamed product"}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price ?? 0}</p>
            </div>
        </Link>
    )
}

export default ProductCard
