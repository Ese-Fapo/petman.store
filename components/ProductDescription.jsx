'use client'

import { ArrowRight, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description');
    const ratings = Array.isArray(product.rating) ? product.rating : [];

    return (
        <div className="my-18 text-sm text-slate-600">
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={tab} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {ratings.length ? (
                        ratings.map((item) => (
                            <div key={item.id || item.createdAt} className="flex gap-5 mb-10">
                                {item.user?.image ? (
                                    <Image src={item.user.image} alt={item.user?.name || "Customer"} className="size-10 rounded-full" width={100} height={100} />
                                ) : (
                                    <div className="size-10 rounded-full bg-slate-100" />
                                )}
                                <div>
                                    <div className="flex items-center">
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                    <p className="text-sm max-w-lg my-4">{item.review}</p>
                                    <p className="font-medium text-slate-800">{item.user?.name || "Customer"}</p>
                                    <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400">No reviews yet.</p>
                    )}
                </div>
            )}

            {product.store && (
                <div className="flex gap-3 mt-14">
                    {product.store.logo ? (
                        <Image src={product.store.logo} alt={product.store.name || "Store logo"} className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
                    ) : (
                        <div className="size-11 rounded-full bg-slate-100 ring ring-slate-200" />
                    )}
                    <div>
                        <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                        <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDescription;
