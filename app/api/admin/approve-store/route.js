import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API for admins to review seller store applications.
const VALID_STATUSES = ["approved", "rejected"];

const json = (body, status = 200) => NextResponse.json(body, { status });

const getAdminAccess = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    // Centralize admin authorization so GET and POST follow the same rule.
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

// Approve or reject a seller store application.
export async function POST(request) {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const { storeId, status } = await request.json();

        if (!storeId || typeof storeId !== "string") {
            return json({ error: "Missing or invalid storeId" }, 400);
        }

        if (!VALID_STATUSES.includes(status)) {
            return json({ error: "Invalid status" }, 400);
        }

        const existingStore = await prisma.store.findUnique({
            where: { id: storeId },
            select: { status: true },
        });

        if (!existingStore) {
            return json({ error: "Store not found" }, 404);
        }

        if (existingStore.status === "approved") {
            return json({ error: "Approved stores can be managed from the stores page" }, 400);
        }

        // Rejected stores stay visible for reconsideration, but cannot be rejected twice.
        if (existingStore.status === "rejected" && status !== "approved") {
            return json({ error: "Rejected stores can only be approved from this page" }, 400);
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: {
                status,
                // Approved stores go live immediately; rejected stores are kept inactive.
                isActive: status === "approved",
            },
            select: storeSelect,
        });

        return json({
            message: `Store ${status} successfully`,
            store,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return json({ error: "Store not found" }, 404);
        }

        console.error("Failed to update store approval:", error);
        return json({ error: "Failed to update store approval" }, 500);
    }
}

// Get pending and rejected applications so admins can change their mind later.
export async function GET() {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const stores = await prisma.store.findMany({
            where: {
                status: { in: ["pending", "rejected"] },
            },
            orderBy: { createdAt: "desc" },
            select: storeSelect,
        });

        return json({ stores });
    } catch (error) {
        console.error("Failed to fetch store applications:", error);
        return json({ error: "Failed to fetch store applications" }, 500);
    }
}
