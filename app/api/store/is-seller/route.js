import authSeller from "@/middlewares/authSeller";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

// Return details for the current approved and active seller store.
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return json({ error: "Not authorized" }, 401);
        }

        const storeInfo = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                id: true,
                name: true,
                username: true,
                description: true,
                address: true,
                logo: true,
                email: true,
                contact: true,
                status: true,
                isActive: true,
            },
        });

        if (!storeInfo) {
            return json({ error: "Store not found" }, 404);
        }

        return json({ isSeller: true, storeInfo });
    } catch (error) {
        console.error("Failed to fetch seller details:", error);
        return json({ error: "Failed to fetch seller details" }, 500);
    }
}
