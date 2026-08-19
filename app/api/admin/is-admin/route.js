import authAdmin from "@/middlewares/authAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

// Verify whether the current user is configured as an admin.
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        return json({ isAdmin: true });
    } catch (error) {
        console.error("Failed to verify admin access:", error);
        return json({ error: "Failed to verify admin access" }, 500);
    }
}
