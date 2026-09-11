import { createSlice } from '@reduxjs/toolkit'


const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        setRatings: (state, action) => {
            state.ratings = Array.isArray(action.payload) ? action.payload : []
        },
        addRating: (state, action) => {
            const rating = action.payload

            if (!rating?.id) {
                return
            }

            const existingIndex = state.ratings.findIndex((item) => item.id === rating.id)

            if (existingIndex >= 0) {
                state.ratings[existingIndex] = rating
                return
            }

            state.ratings.push(rating)
        },
    }
})

export const { addRating, setRatings } = ratingSlice.actions

export default ratingSlice.reducer
