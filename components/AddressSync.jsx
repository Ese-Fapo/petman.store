'use client'

import { setAddresses } from "@/lib/features/address/addressSlice"
import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const AddressSync = () => {
    const { isLoaded, isSignedIn } = useUser()
    const dispatch = useDispatch()

    useEffect(() => {
        const loadAddresses = async () => {
            if (!isLoaded) {
                return
            }

            if (!isSignedIn) {
                dispatch(setAddresses([]))
                return
            }

            try {
                const response = await fetch("/api/address")
                const data = await response.json()

                if (response.ok && Array.isArray(data.addresses)) {
                    dispatch(setAddresses(data.addresses))
                }
            } catch {
                // Keep the checkout usable if addresses cannot be loaded.
            }
        }

        loadAddresses()
    }, [dispatch, isLoaded, isSignedIn])

    return null
}

export default AddressSync
