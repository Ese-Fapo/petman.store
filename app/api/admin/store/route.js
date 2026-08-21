import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

const getAdminAccess = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    return authAdmin(userId);
};

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

// Get all approved stores for admin management.
export async function GET() {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const stores = await prisma.store.findMany({
            where: { status: "approved" },
            orderBy: { createdAt: "desc" },
            select: storeSelect,
        });

        return json({ stores });
    } catch (error) {
        console.error("Failed to fetch stores:", error);
        return json({ error: "Failed to fetch stores" }, 500);
    }
}

// Toggle whether an approved store is live on the public shop.
export async function PATCH(request) {
    try {
        const isAdmin = await getAdminAccess();

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

        const existingStore = await prisma.store.findUnique({
            where: { id: storeId },
            select: { status: true },
        });

        if (!existingStore) {
            return json({ error: "Store not found" }, 404);
        }

        if (existingStore.status !== "approved") {
            return json({ error: "Only approved stores can be activated" }, 400);
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: { isActive },
            select: storeSelect,
        });

        return json({
            message: `Store ${isActive ? "activated" : "deactivated"} successfully`,
            store,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return json({ error: "Store not found" }, 404);
        }

        console.error("Failed to update store:", error);
        return json({ error: "Failed to update store" }, 500);
    }
}
