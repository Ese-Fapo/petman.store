import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
    user: {
        select: {
            id: true,
            name: true,
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

const getSellerStoreId = async () => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    return authSeller(userId);
};

// Get all orders for the current seller.
export async function GET() {
    try {
        const storeId = await getSellerStoreId();

        if (!storeId) {
            return json({ error: "Not authorized" }, 401);
        }

        const orders = await prisma.order.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
            select: orderSelect,
        });

        return json({ orders });
    } catch (error) {
        console.error("Failed to fetch seller orders:", error);
        return json({ error: "Failed to fetch seller orders" }, 500);
    }
}

// Update the status of an order owned by the current seller.
export async function PATCH(request) {
    try {
        const storeId = await getSellerStoreId();

        if (!storeId) {
            return json({ error: "Not authorized" }, 401);
        }

        const { orderId, status } = await request.json();

        if (!orderId || typeof orderId !== "string") {
            return json({ error: "Missing or invalid orderId" }, 400);
        }

        if (!VALID_ORDER_STATUSES.includes(status)) {
            return json({ error: "Invalid order status" }, 400);
        }

        const existingOrder = await prisma.order.findFirst({
            where: {
                id: orderId,
                storeId,
            },
            select: {
                id: true,
            },
        });

        if (!existingOrder) {
            return json({ error: "Order not found" }, 404);
        }

        const order = await prisma.order.update({
            where: { id: existingOrder.id },
            data: { status },
            select: orderSelect,
        });

        return json({
            message: "Order status updated",
            order,
        });
    } catch (error) {
        console.error("Failed to update seller order status:", error);
        return json({ error: "Failed to update order status" }, 500);
    }
}
