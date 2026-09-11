import { MapPinIcon, PlusIcon, SquarePenIcon, TruckIcon, XIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { deleteAddress } from '@/lib/features/address/addressSlice';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { Show } from '@clerk/nextjs';
import { IRELAND_DELIVERY_RULES, calculateCartDelivery } from '@/lib/deliveryFee';
import StoreCoupons from './StoreCoupons';

const OrderSummary = ({ totalPrice, items, vendorCount = 0 }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'EUR';

    const router = useRouter();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const couponEligibleSubtotal = useMemo(() => {
        if (!coupon?.storeId) {
            return totalPrice;
        }

        return items.reduce((sum, item) => {
            const storeId = item.store?.id || item.storeId;
            return storeId === coupon.storeId ? sum + Number(item.price || 0) * Number(item.quantity || 0) : sum;
        }, 0);
    }, [coupon, items, totalPrice]);
    const couponDiscount = coupon ? coupon.discount / 100 * couponEligibleSubtotal : 0;
    const plusTotal = Math.max(totalPrice - couponDiscount, 0);

    // Recalculate delivery whenever the address or cart items change.
    
    const deliverySummary = useMemo(() => calculateCartDelivery({
        items,
        customerAddress: selectedAddress,
    }), [items, selectedAddress]);
    const hasDeliveryEstimate = Boolean(selectedAddress?.id);
    const deliveryTotal = hasDeliveryEstimate ? deliverySummary.totalFee : 0;
    const standardTotal = plusTotal + deliveryTotal;
    const availableCoupons = useMemo(() => {
        const couponsByCode = new Map();

        for (const item of items) {
            const coupons = Array.isArray(item.store?.coupons) ? item.store.coupons : [];

            for (const itemCoupon of coupons) {
                if (!couponsByCode.has(itemCoupon.code)) {
                    couponsByCode.set(itemCoupon.code, {
                        ...itemCoupon,
                        store: item.store,
                    });
                }
            }
        }

        return [...couponsByCode.values()];
    }, [items]);
    const formatMoney = (amount) => `${currency}${Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    const applyCouponCode = async (codeValue) => {
        const code = codeValue.trim()

        if (!code) {
            throw new Error('Enter a coupon code')
        }

        try {
            setIsApplyingCoupon(true)
            // The API validates expiry, membership, and new-customer restrictions server-side.
            const response = await fetch(`/api/coupon?code=${encodeURIComponent(code)}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to apply coupon')
            }

            if (data.coupon?.storeId) {
                const hasMatchingStore = items.some((item) => (item.store?.id || item.storeId) === data.coupon.storeId)

                if (!hasMatchingStore) {
                    throw new Error('Coupon does not apply to any shop in this cart')
                }
            }

            setCoupon(data.coupon)
            setCouponCodeInput(data.coupon.code)
            return data.message || 'Coupon applied successfully'
        } finally {
            setIsApplyingCoupon(false)
        }
    }

    const handleCouponCode = async (event) => {
        event.preventDefault();
        return applyCouponCode(couponCodeInput)
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (isPlacingOrder) {
            return 'Order is already being placed'
        }

        if (!selectedAddress?.id) {
            throw new Error('Select a delivery address')
        }

        if (!items.length) {
            throw new Error('Your cart is empty')
        }

        try {
            setIsPlacingOrder(true)
            // Send only product ids and quantities; the server re-reads prices from the database.
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    addressId: selectedAddress.id,
                    paymentMethod,
                    couponCode: coupon?.code || "",
                    items: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                }),
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to place order')
            }

            dispatch(clearCart())
            router.push('/orders')
            return data.message || 'Order placed successfully';
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const handleDeleteAddress = async (addressId) => {
        // Address ownership is checked by the API before deletion.
        const response = await fetch("/api/address", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ addressId }),
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete address")
        }

        if (selectedAddress?.id === addressId) {
            setSelectedAddress(null)
        }

        dispatch(deleteAddress(addressId))
        return data.message
    }

    return (
        <div className='w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50/30 p-5 text-sm text-slate-500 sm:p-7 lg:max-w-[340px]'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" name="payment" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' disabled className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-not-allowed text-slate-300'>Stripe Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex items-start gap-2'>
                            <p className='min-w-0 flex-1 break-words'>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='shrink-0 cursor-pointer' size={18} />
                            {selectedAddress.id && (
                                <XIcon
                                    size={18}
                                    onClick={() => toast.promise(handleDeleteAddress(selectedAddress.id), {
                                        loading: 'Deleting address...',
                                        success: (message) => message || 'Address deleted successfully',
                                        error: (error) => error.message || 'Failed to delete address',
                                    })}
                                    className='shrink-0 cursor-pointer hover:text-red-700 transition'
                                />
                            )}
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={address.id || index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button type="button" className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                {vendorCount > 1 && (
                    <div className='mb-3 rounded border border-green-100 bg-green-50 p-3 text-xs leading-5 text-green-700'>
                        This cart will create {vendorCount} separate shop orders. Delivery is calculated separately because each Irish vendor sends their own parcel.
                    </div>
                )}
                <div className='mb-4 rounded border border-slate-200 bg-white p-3'>
                    <div className='flex items-center gap-2 font-medium text-slate-700'>
                        <TruckIcon size={16} className='text-green-600' />
                        Ireland delivery
                    </div>
                    <p className='mt-1 text-xs leading-5 text-slate-500'>
                        {formatMoney(IRELAND_DELIVERY_RULES.baseFee)} covers the first {IRELAND_DELIVERY_RULES.baseKm} km, then distance bands apply up to {formatMoney(IRELAND_DELIVERY_RULES.maxFee)} per shop. Shop subtotals over {formatMoney(IRELAND_DELIVERY_RULES.freeDeliverySubtotal)} get free delivery.
                    </p>
                    {!hasDeliveryEstimate ? (
                        <p className='mt-2 rounded bg-amber-50 px-2 py-1.5 text-xs text-amber-700'>Select a delivery address to show the distance and fee from each vendor.</p>
                    ) : (
                        <div className='mt-3 space-y-2'>
                            {deliverySummary.shops.map((shop) => (
                                <div key={shop.storeId} className='rounded border border-slate-100 bg-slate-50 px-3 py-2 text-xs'>
                                    <div className='flex items-start justify-between gap-3'>
                                        <div className='min-w-0'>
                                            <p className='truncate font-medium text-slate-700'>{shop.storeName}</p>
                                            <p className='mt-0.5 flex gap-1 text-slate-500'>
                                                <MapPinIcon size={13} className='mt-0.5 shrink-0' />
                                                {shop.delivery.distanceKm === null
                                                    ? 'Location estimate unavailable'
                                                    : `${shop.delivery.distanceKm} km estimated`}
                                            </p>
                                        </div>
                                        <p className='shrink-0 font-semibold text-slate-800'>
                                            <Show when={{ plan: "plus" }} fallback={formatMoney(shop.delivery.fee)}>
                                                Free
                                            </Show>
                                        </p>
                                    </div>
                                    <p className='mt-1 leading-5 text-slate-500'>{shop.delivery.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className='flex justify-between gap-4'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Delivery:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{formatMoney(totalPrice)}</p>
                        <p>
                            <Show when={{ plan: "plus" }} fallback={hasDeliveryEstimate ? formatMoney(deliveryTotal) : 'Select address'}>
                                Free
                            </Show>
                        </p>
                        {coupon && <p>-{formatMoney(couponDiscount)}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <div className='mt-3 space-y-3'>
                            <form onSubmit={e => toast.promise(handleCouponCode(e), {
                                loading: 'Checking Coupon...',
                                success: (message) => message || 'Coupon applied successfully',
                                error: (error) => error.message || 'Failed to apply coupon',
                            })} className='grid gap-3 sm:grid-cols-[1fr_auto]'>
                                <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='min-w-0 border border-slate-400 p-1.5 rounded w-full outline-none' />
                                <button type="submit" disabled={isApplyingCoupon} className='bg-slate-600 text-white px-3 py-1.5 rounded hover:bg-slate-800 active:scale-95 transition-all disabled:cursor-not-allowed disabled:bg-slate-300'>{isApplyingCoupon ? 'Checking' : 'Apply'}</button>
                            </form>
                            {availableCoupons.length > 0 && (
                                <div>
                                    <p className='mb-2 text-xs font-medium text-slate-500'>Available store coupons</p>
                                    <StoreCoupons
                                        coupons={availableCoupons}
                                        compact
                                        onApply={(code) => toast.promise(applyCouponCode(code), {
                                            loading: 'Applying coupon...',
                                            success: (message) => message || 'Coupon applied successfully',
                                            error: (error) => error.message || 'Failed to apply coupon',
                                        })}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='w-full flex flex-wrap items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            {coupon.store?.name && <p>Applies to {coupon.store.name}</p>}
                            <XIcon size={18} onClick={() => setCoupon(null)} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between gap-4 py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>
                    <Show when={{ plan: "plus" }} fallback={formatMoney(standardTotal)}>
                        {formatMoney(plusTotal)}
                    </Show>
                </p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), {
                loading: 'Placing order...',
                success: (message) => message || 'Order placed successfully',
                error: (error) => error.message || 'Failed to place order',
            })} disabled={isPlacingOrder} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all disabled:cursor-not-allowed disabled:bg-slate-300'>{isPlacingOrder ? 'Placing Order...' : 'Place Order'}</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </div>
    )
}

export default OrderSummary
