import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

// Keep the API response aligned with the admin store list UI.
const storeSelect = {
    id: true,
    name: true,
    username: true,
    description: true,
    address: true,
    status: true,
    isActive: true,
    logo: true,
    email: true,
    contact: true,
    createdAt: true,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
};

// Toggle whether an approved store is live on the public shop.
export async function POST(request) {
    try {
        // Only configured admins can activate or deactivate stores.
        const { userId } = await auth();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const { storeId, isActive } = await request.json();

        if (!storeId || typeof storeId !== "string") {
            return json({ error: "Missing or invalid storeId" }, 400);
        }

        if (typeof isActive !== "boolean") {
            return json({ error: "Missing or invalid isActive" }, 400);
        }

        // A store must be approved before it can be shown or hidden publicly.
        const existingStore = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                id: true,
                status: true,
            },
        });

        if (!existingStore) {
            return json({ error: "Store not found" }, 404);
        }

        if (existingStore.status !== "approved") {
            return json({ error: "Only approved stores can be toggled" }, 400);
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: { isActive },
            select: storeSelect,
        });

        return json({
            message: `Store €{store.isActive ? "activated" : "deactivated"} successfully`,
            store,
        });
    } catch (error) {
        console.error("Failed to toggle store:", error);
        return json({ error: "Failed to toggle store" }, 500);
    }
}
