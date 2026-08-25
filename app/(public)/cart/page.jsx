'use client'
import Counter from "@/components/Counter";
import Loading from "@/components/Loading";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart, setCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR';
    
    const { cartItems, total } = useSelector(state => state.cart);
    const { list: products, loading: productsLoading, error: productsError } = useSelector(state => state.product);

    const dispatch = useDispatch();

    const cartArray = useMemo(() => {
        const productById = new Map(products.map((product) => [product.id, product]));
        const nextCartArray = [];

        for (const [key, value] of Object.entries(cartItems)) {
            const product = productById.get(key);
            if (product) {
                nextCartArray.push({
                    ...product,
                    quantity: value,
                });
            }
        }

        return nextCartArray;
    }, [cartItems, products]);

    const totalPrice = useMemo(
        () => cartArray.reduce((total, item) => total + item.price * item.quantity, 0),
        [cartArray]
    );

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    useEffect(() => {
        if (productsLoading || productsError || total === 0) {
            return;
        }

        const availableProductIds = new Set(products.map((product) => product.id));
        const availableCartItems = Object.fromEntries(
            Object.entries(cartItems).filter(([productId]) => availableProductIds.has(productId))
        );

        if (Object.keys(availableCartItems).length !== Object.keys(cartItems).length) {
            dispatch(setCart(availableCartItems));
        }
    }, [cartItems, dispatch, products, productsError, productsLoading, total]);

    if (productsLoading && total > 0) {
        return <Loading />
    }

    return cartArray.length > 0 ? (
        <div className="min-h-screen px-4 text-slate-800 sm:px-6">

            <div className="max-w-7xl mx-auto ">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Add more" />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">

                    <div className="w-full max-w-4xl overflow-x-auto">
                    <table className="min-w-[560px] w-full text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th className="max-md:hidden">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                cartArray.map((item) => (
                                    <tr key={item.id} className="space-x-2">
                                        <td className="flex gap-3 my-4">
                                            <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                                                {item.images?.[0] && (
                                                    <Image src={item.images[0]} className="h-14 w-auto object-contain" alt={item.name || "Product image"} width={45} height={45} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="max-sm:text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.category}</p>
                                                <p>{currency}{item.price}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Counter productId={item.id} />
                                        </td>
                                        <td className="text-center">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                        <td className="text-center max-md:hidden">
                                            <button onClick={() => handleDeleteItemFromCart(item.id)} className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    </div>
                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
        </div>
    )
}
