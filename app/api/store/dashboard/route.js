import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";

const json = (body, status = 200) => NextResponse.json(body, { status });

// Get dashboard data for the current seller.
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

        const [orders, products] = await Promise.all([
            prisma.order.findMany({
                where: { storeId },
                select: { id: true, total: true },
            }),
            prisma.product.findMany({
                where: { storeId },
                select: { id: true },
            }),
        ]);

        const productIds = products.map((product) => product.id);
        const ratings = productIds.length
            ? await prisma.rating.findMany({
                where: { productId: { in: productIds } },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    rating: true,
                    review: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                },
            })
            : [];

        return json({
            dashboardData: {
                ratings,
                totalOrders: orders.length,
                totalEarnings: Math.round(orders.reduce((acc, order) => acc + Number(order.total || 0), 0)),
                totalProducts: products.length,
            },
        });
    } catch (error) {
        console.error("Failed to fetch seller dashboard:", error);
        return json({ error: "Failed to fetch seller dashboard" }, 500);
    }
}
