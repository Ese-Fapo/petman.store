'use client'

import { setCart } from "@/lib/features/cart/cartSlice"
import { useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"

const CartSync = () => {
    const { isLoaded, isSignedIn } = useUser()
    const cartItems = useSelector((state) => state.cart.cartItems)
    const dispatch = useDispatch()
    const hasLoadedCart = useRef(false)

    useEffect(() => {
        const loadCart = async () => {
            if (!isLoaded || !isSignedIn || hasLoadedCart.current) {
                return
            }

            try {
                const response = await fetch("/api/cart")
                const data = await response.json()

                if (response.ok) {
                    dispatch(setCart({ ...(data.cart || {}), ...cartItems }))
                }
            } catch {
                // Keep the local cart usable if the saved cart cannot be loaded.
            } finally {
                hasLoadedCart.current = true
            }
        }

        loadCart()
    }, [cartItems, dispatch, isLoaded, isSignedIn])

    useEffect(() => {
        const saveCart = async () => {
            if (!isLoaded || !isSignedIn || !hasLoadedCart.current) {
                return
            }

            try {
                await fetch("/api/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ cart: cartItems }),
                })
            } catch {
                // The in-memory cart remains the source of truth until sync works again.
            }
        }

        saveCart()
    }, [cartItems, isLoaded, isSignedIn])

    return null
}

export default CartSync
