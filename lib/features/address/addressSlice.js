import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        setAddresses: (state, action) => {
            state.list = Array.isArray(action.payload) ? action.payload : []
        },
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
        updateAddress: (state, action) => {
            state.list = state.list.map((address) =>
                address.id === action.payload.id ? action.payload : address
            )
        },
        deleteAddress: (state, action) => {
            state.list = state.list.filter((address) => address.id !== action.payload)
        },
    }
})

export const { addAddress, deleteAddress, setAddresses, updateAddress } = addressSlice.actions

export default addressSlice.reducer
