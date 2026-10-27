'use client'

import ProductCard from './ProductCard'
import Title from './Title'
import { useSelector } from 'react-redux'

const LatestProducts = () => {

    const displayQuantity = 4
    const { list: products, loading } = useSelector(state => state.product)
    const visibleProducts = products
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, displayQuantity)

    if (loading) {
        return null
    }

    return (
        <div className='px-6 my-12 max-w-7xl mx-auto'>
            <Title title='Fresh finds from our sellers' description={`Showing ${visibleProducts.length} of ${products.length} products`} href='/shop' />
            {visibleProducts.length ? (
                <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <p className='mt-12 text-sm text-slate-400'>Our marketplace is growing. Explore the categories above, or open your own store to share your products.</p>
            )}
        </div>
    )
}

export default LatestProducts
