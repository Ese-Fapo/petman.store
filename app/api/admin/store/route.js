import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API for admins to manage approved stores and permanent store deletion.
const json = (body, status = 200) => NextResponse.json(body, { status });

const getAdminAccess = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    // Reuse the same email-based admin check across every handler in this route.
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

// Permanently delete a store and the records that depend on it.
export async function DELETE(request) {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const { storeId, confirmation } = await request.json();

        if (!storeId || typeof storeId !== "string") {
            return json({ error: "Missing or invalid storeId" }, 400);
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: {
                id: true,
                name: true,
                Product: {
                    select: { id: true },
                },
            },
        });

        if (!store) {
            return json({ error: "Store not found" }, 404);
        }

        if (confirmation !== store.name) {
            return json({ error: "Store name confirmation does not match" }, 400);
        }

        const productIds = store.Product.map((product) => product.id);

        // Delete dependent records first because orders and ratings reference store products.
        await prisma.$transaction([
            prisma.orderItem.deleteMany({
                where: {
                    OR: [
                        { order: { storeId } },
                        { productId: { in: productIds } },
                    ],
                },
            }),
            prisma.order.deleteMany({
                where: { storeId },
            }),
            prisma.rating.deleteMany({
                where: {
                    productId: { in: productIds },
                },
            }),
            prisma.store.delete({
                where: { id: storeId },
            }),
        ]);

        return json({ message: "Store permanently deleted successfully" });
    } catch (error) {
        if (error.code === "P2025") {
            return json({ error: "Store not found" }, 404);
        }

        console.error("Failed to permanently delete store:", error);
        return json({ error: "Failed to permanently delete store" }, 500);
    }
}
