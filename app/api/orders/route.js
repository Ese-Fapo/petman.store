import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const VALID_PAYMENT_METHODS = ["COD"];

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
    address: true,
    orderItems: {
        include: {
            product: true,
        },
    },
};

const getCurrentUserId = async () => {
    const { userId } = await auth();
    return userId || null;
};

const normalizeOrderItems = (items) => {
    if (!Array.isArray(items)) {
        return [];
    }

    const normalizedItems = new Map();

    for (const item of items) {
        const productId = typeof item?.productId === "string" ? item.productId : "";
        const quantity = Number(item?.quantity);

        if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
            continue;
        }

        normalizedItems.set(productId, (normalizedItems.get(productId) || 0) + quantity);
    }

    return [...normalizedItems.entries()].map(([productId, quantity]) => ({ productId, quantity }));
};

// Get the current buyer's order history.
export async function GET() {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: orderSelect,
        });

        return json({ orders });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return json({ error: "Failed to fetch orders" }, 500);
    }
}

// Create one order per store represented in the cart.
export async function POST(request) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const { addressId, paymentMethod, items, couponCode } = await request.json();

        if (!addressId || typeof addressId !== "string") {
            return json({ error: "Select a delivery address" }, 400);
        }

        if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
            return json({ error: "Selected payment method is not available" }, 400);
        }

        const normalizedItems = normalizeOrderItems(items);

        if (!normalizedItems.length) {
            return json({ error: "Your cart is empty" }, 400);
        }

        const address = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId,
            },
            select: { id: true },
        });

        if (!address) {
            return json({ error: "Address not found" }, 404);
        }

        let coupon = null;
        const normalizedCouponCode = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";

        if (normalizedCouponCode) {
            coupon = await prisma.coupon.findUnique({
                where: { code: normalizedCouponCode },
            });

            if (!coupon || coupon.expiresAt <= new Date() || (!coupon.isPublic && !coupon.forNewUser)) {
                return json({ error: "Coupon not found or expired" }, 400);
            }

            if (coupon.forNewUser) {
                const existingOrderCount = await prisma.order.count({
                    where: { userId },
                });

                if (existingOrderCount > 0) {
                    return json({ error: "Coupon is only available for new customers" }, 400);
                }
            }
        }

        const productIds = normalizedItems.map((item) => item.productId);
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                inStock: true,
                store: {
                    status: "approved",
                    isActive: true,
                },
            },
            select: {
                id: true,
                price: true,
                storeId: true,
            },
        });
        const productById = new Map(products.map((product) => [product.id, product]));
        const unavailableItem = normalizedItems.find((item) => !productById.has(item.productId));

        if (unavailableItem) {
            return json({ error: "One or more cart items are no longer available" }, 400);
        }

        const itemsByStore = new Map();

        for (const item of normalizedItems) {
            const product = productById.get(item.productId);
            const storeItems = itemsByStore.get(product.storeId) || [];

            storeItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
            itemsByStore.set(product.storeId, storeItems);
        }

        const orders = await prisma.$transaction(async (tx) => {
            const createdOrders = [];

            for (const [storeId, orderItems] of itemsByStore.entries()) {
                const total = orderItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
                const discount = coupon ? coupon.discount / 100 * total : 0;

                const order = await tx.order.create({
                    data: {
                        total: Math.max(total - discount, 0),
                        userId,
                        storeId,
                        addressId,
                        isPaid: false,
                        paymentMethod,
                        isCouponUsed: Boolean(coupon),
                        coupon: coupon
                            ? {
                                code: coupon.code,
                                description: coupon.description,
                                discount: coupon.discount,
                            }
                            : {},
                        orderItems: {
                            create: orderItems,
                        },
                    },
                    select: orderSelect,
                });

                createdOrders.push(order);
            }

            await tx.user.update({
                where: { id: userId },
                data: { cart: {} },
            });

            return createdOrders;
        });

        return json({
            message: orders.length > 1 ? "Orders placed successfully" : "Order placed successfully",
            orders,
        }, 201);
    } catch (error) {
        console.error("Failed to place order:", error);
        return json({ error: "Failed to place order" }, 500);
    }
}
