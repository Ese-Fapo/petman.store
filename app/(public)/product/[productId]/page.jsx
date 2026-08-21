'use client'

import Loading from "@/components/Loading";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                return;
            }

            setLoading(true);
            setError("");

            const cachedProduct = products.find((product) => product.id === productId);

            if (cachedProduct) {
                setProduct(cachedProduct);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/products/${encodeURIComponent(productId)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch product");
                }

                setProduct(data.product);
            } catch (error) {
                setProduct(null);
                setError(error.message || "Failed to fetch product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [productId, products]);

    if (loading) {
        return <Loading />;
    }

    if (error || !product) {
        return (
            <div className="mx-6 flex min-h-[70vh] items-center justify-center text-center text-slate-500">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-700">Product not found</h1>
                    <p className="mt-3 text-sm">{error || "This product is no longer available."}</p>
                    <Link href="/shop" className="mt-6 inline-flex rounded bg-slate-800 px-5 py-2 text-sm text-white transition hover:bg-slate-900">
                        Back to shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product.category}
                </div>

                <ProductDetails product={product} />
                <ProductDescription product={product} />
            </div>
        </div>
    );
}
