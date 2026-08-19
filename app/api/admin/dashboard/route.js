import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

// Get dashboard data for admin: total orders, stores, products, revenue, and chart orders.
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const [products, stores, orders, revenue, allOrders] = await Promise.all([
            prisma.product.count(),
            prisma.store.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: {
                    total: true,
                },
            }),
            prisma.order.findMany({
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    total: true,
                    createdAt: true,
                },
            }),
        ]);

        return json({
            dashboardData: {
                products,
                stores,
                orders,
                revenue: Number(revenue._sum.total || 0).toFixed(2),
                allOrders,
            },
        });
    } catch (error) {
        console.error("Failed to fetch admin dashboard:", error);
        return json({ error: "Failed to fetch admin dashboard" }, 500);
    }
}
