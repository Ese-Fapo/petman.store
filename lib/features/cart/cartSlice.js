import { createSlice } from '@reduxjs/toolkit'

const normalizeCartItems = (cartItems) => {
    if (!cartItems || typeof cartItems !== 'object' || Array.isArray(cartItems)) {
        return {}
    }

    return Object.fromEntries(
        Object.entries(cartItems)
            .map(([productId, quantity]) => [productId, Number(quantity)])
            .filter(([productId, quantity]) =>
                typeof productId === 'string' &&
                productId.length > 0 &&
                Number.isInteger(quantity) &&
                quantity > 0
            )
    )
}

const getTotal = (cartItems) =>
    Object.values(cartItems).reduce((total, quantity) => total + quantity, 0)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload || {}

            if (!productId) {
                return
            }

            state.cartItems[productId] = (state.cartItems[productId] || 0) + 1
            state.total = getTotal(state.cartItems)
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload || {}

            if (!productId || !state.cartItems[productId]) {
                return
            }

            state.cartItems[productId] -= 1

            if (state.cartItems[productId] <= 0) {
                delete state.cartItems[productId]
            }

            state.total = getTotal(state.cartItems)
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload || {}

            if (!productId) {
                return
            }

            delete state.cartItems[productId]
            state.total = getTotal(state.cartItems)
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
        setCart: (state, action) => {
            state.cartItems = normalizeCartItems(action.payload)
            state.total = getTotal(state.cartItems)
        },
    },
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart, setCart } = cartSlice.actions

export default cartSlice.reducer
