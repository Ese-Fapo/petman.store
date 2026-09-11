'use client'

import { setCart } from "@/lib/features/cart/cartSlice"
import { useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"

const mergeCarts = (savedCart, localCart) => {
    const mergedCart = { ...(savedCart || {}) }

    // Preserve local items added before sign-in by adding them to the saved server cart.
    for (const [productId, quantity] of Object.entries(localCart || {})) {
        mergedCart[productId] = (Number(mergedCart[productId]) || 0) + (Number(quantity) || 0)
    }

    return mergedCart
}

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
                // Load once per signed-in session so local updates do not get overwritten repeatedly.
                const response = await fetch("/api/cart")
                const data = await response.json()

                if (response.ok) {
                    dispatch(setCart(mergeCarts(data.cart, cartItems)))
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
                // After the initial load, persist every cart change for the authenticated user.
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
