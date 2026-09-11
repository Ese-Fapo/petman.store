import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

// Public store profile API used by /shop/[username].

const json = (body, status = 200) => NextResponse.json(body, { status });

// Get public store info and in-stock store products.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username")?.trim().toLowerCase();

        if (!username) {
            return json({ error: "Missing username" }, 400);
        }

        const store = await prisma.store.findFirst({
            where: {
                username,
                // Only approved and active stores are visible to customers.
                status: "approved",
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                username: true,
                description: true,
                address: true,
                logo: true,
                email: true,
                contact: true,
                Product: {
                    where: { inStock: true },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        mrp: true,
                        price: true,
                        images: true,
                        category: true,
                        inStock: true,
                        storeId: true,
                        createdAt: true,
                        updatedAt: true,
                        rating: {
                            select: {
                                id: true,
                                rating: true,
                                review: true,
                                createdAt: true,
                            },
                        },
                    },
                },
                Coupon: {
                    where: {
                        isPublic: true,
                        expiresAt: { gt: new Date() },
                    },
                    orderBy: { createdAt: "desc" },
                    select: {
                        code: true,
                        description: true,
                        discount: true,
                        expiresAt: true,
                        storeId: true,
                    },
                },
            },
        });

        if (!store) {
            return json({ error: "Store not found" }, 404);
        }

        const { Product, Coupon, ...storeInfo } = store;

        return json({
            store: storeInfo,
            products: Product,
            coupons: Coupon,
        });
    } catch (error) {
        console.error("Failed to fetch store data:", error);
        return json({ error: "Failed to fetch store data" }, 500);
    }
}
