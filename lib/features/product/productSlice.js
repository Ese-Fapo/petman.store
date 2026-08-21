import { createSlice } from '@reduxjs/toolkit'


const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        loading: true,
        error: "",
    },
    reducers: {
        setProductLoading: (state, action) => {
            state.loading = Boolean(action.payload)
        },
        setProductError: (state, action) => {
            state.error = action.payload || ""
            state.loading = false
        },
        setProduct: (state, action) => {
            state.list = Array.isArray(action.payload) ? action.payload : []
            state.loading = false
            state.error = ""
        },
        upsertProduct: (state, action) => {
            const product = action.payload

            if (!product?.id) {
                return
            }

            const index = state.list.findIndex((item) => item.id === product.id)

            if (index >= 0) {
                state.list[index] = product
            } else {
                state.list.unshift(product)
            }

            state.error = ""
        },
        clearProduct: (state) => {
            state.list = []
            state.loading = false
        },
    },
})

export const { clearProduct, setProduct, setProductError, setProductLoading, upsertProduct } = productSlice.actions

export default productSlice.reducer
