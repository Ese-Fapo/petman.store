import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";


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
            },
        });

        if (!store) {
            return json({ error: "Store not found" }, 404);
        }

        const { Product, ...storeInfo } = store;

        return json({
            store: storeInfo,
            products: Product,
        });
    } catch (error) {
        console.error("Failed to fetch store data:", error);
        return json({ error: "Failed to fetch store data" }, 500);
    }
}
