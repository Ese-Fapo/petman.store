'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { CreditCardIcon, EarthIcon, StarIcon, TagIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR';
    const images = Array.isArray(product.images) ? product.images : [];
    const ratings = Array.isArray(product.rating) ? product.rating : [];
    const mainProductImage = images[0] || null;

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(mainProductImage);

    useEffect(() => {
        setMainImage(mainProductImage);
    }, [mainProductImage]);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }));
    };

    const averageRating = ratings.length
        ? ratings.reduce((acc, item) => acc + Number(item.rating || 0), 0) / ratings.length
        : 0;
    const savingPercent = product.mrp > 0
        ? Math.max(0, ((product.mrp - product.price) / product.mrp * 100)).toFixed(0)
        : 0;

    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {images.map((image, index) => (
                        <button key={image} type="button" onClick={() => setMainImage(image)} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt={`${product.name || "Product"} image ${index + 1}`} width={45} height={45} />
                        </button>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg">
                    {mainImage ? (
                        <Image src={mainImage} alt={product.name || "Product image"} width={250} height={250} />
                    ) : (
                        <div className="text-sm text-slate-400">No image</div>
                    )}
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratings.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p>{currency}{product.price}</p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Save {savingPercent}% right now</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {cart[productId] && (
                        <div className="flex flex-col gap-3">
                            <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                            <Counter productId={productId} />
                        </div>
                    )}
                    <button onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition">
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free delivery across Ireland on qualifying orders </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by Irish pet owners </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
