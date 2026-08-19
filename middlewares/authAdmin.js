import { clerkClient } from "@clerk/nextjs/server"

const authAdmin = async (userId) => {
    try {
        if (!userId) {
            return false
        }

        const adminEmails = (process.env.ADMIN_EMAIL || "")
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)

        if (!adminEmails.length) {
            console.error("ADMIN_EMAIL is not set")
            return false
        }

        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        const userEmail = user.emailAddresses
            ?.find((email) => email.id === user.primaryEmailAddressId)
            ?.emailAddress
            || user.emailAddresses?.[0]?.emailAddress

        return Boolean(userEmail && adminEmails.includes(userEmail.toLowerCase()))
    } catch (error) {
        console.error("Failed to authorize admin:", error)
        return false
    }
}

export default authAdmin
