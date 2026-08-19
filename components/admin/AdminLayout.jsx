'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { SignInButton, useUser } from "@clerk/nextjs"

const AdminLayout = ({ children }) => {

    const { isLoaded, isSignedIn } = useUser()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchIsAdmin = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch("/api/admin/is-admin")
            const data = await response.json()

            if (!response.ok) {
                setIsAdmin(false)
                setError(data.error || "Not authorized")
                return
            }

            setIsAdmin(Boolean(data.isAdmin))
        } catch (error) {
            setIsAdmin(false)
            setError(error.message || "Failed to verify admin access")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isLoaded) {
            return
        }

        if (!isSignedIn) {
            setIsAdmin(false)
            setError("Please log in to continue")
            setLoading(false)
            return
        }

        fetchIsAdmin()
    }, [isLoaded, isSignedIn])

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
                {isSignedIn ? "You are not authorized to access this page" : "Log in to access the admin page"}
            </h1>
            {error && <p className="mt-3 text-sm text-slate-400">{error}</p>}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {!isSignedIn && (
                    <SignInButton mode="modal">
                        <button type="button" className="bg-green-600 text-white p-2 px-6 max-sm:text-sm rounded-full">
                            Login
                        </button>
                    </SignInButton>
                )}
                <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 p-2 px-6 max-sm:text-sm rounded-full">
                    Go to home <ArrowRightIcon size={18} />
                </Link>
            </div>
        </div>
    )
}

export default AdminLayout
