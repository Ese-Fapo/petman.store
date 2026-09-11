import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API for admins to inspect and correct platform-wide orders.
const VALID_ORDER_STATUSES = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

const json = (body, status = 200) => NextResponse.json(body, { status });

const orderSelect = {
    id: true,
    total: true,
    status: true,
    paymentMethod: true,
    isPaid: true,
    isCouponUsed: true,
    coupon: true,
    createdAt: true,
    updatedAt: true,
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    store: {
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
        },
    },
    address: true,
    orderItems: {
        include: {
            product: true,
        },
    },
};

const getAdminAccess = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    // Admin authorization is centralized so GET and PATCH use the same rule.
    return authAdmin(userId);
};

// Get every platform order for admin operations.
export async function GET() {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            select: orderSelect,
        });

        return json({ orders });
    } catch (error) {
        console.error("Failed to fetch admin orders:", error);
        return json({ error: "Failed to fetch admin orders" }, 500);
    }
}

// Allow admins to correct or advance any order status.
export async function PATCH(request) {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const { orderId, status } = await request.json();

        if (!orderId || typeof orderId !== "string") {
            return json({ error: "Missing or invalid orderId" }, 400);
        }

        if (!VALID_ORDER_STATUSES.includes(status)) {
            return json({ error: "Invalid order status" }, 400);
        }

        // Admins can update any order; seller routes are scoped to one store instead.
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            select: orderSelect,
        });

        return json({
            message: "Order status updated",
            order,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return json({ error: "Order not found" }, 404);
        }

        console.error("Failed to update admin order:", error);
        return json({ error: "Failed to update order" }, 500);
    }
}
