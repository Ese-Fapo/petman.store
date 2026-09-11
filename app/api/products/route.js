import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public product catalogue API for products customers can actually buy.
const json = (body, status = 200) => NextResponse.json(body, { status });

// Get public in-stock products from approved and active stores.
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        store: {
          status: "approved",
          isActive: true,
        },
      },
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
            createdAt: true,
            rating: true,
            review: true,
            orderId: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
            address: true,
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add rating totals so product cards do not need to calculate display metadata themselves.
    const productsWithSummary = products.map((product) => {
      const ratings = Array.isArray(product.rating) ? product.rating : [];
      const averageRating = ratings.length
        ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length
        : 0;

      return {
        ...product,
        store: product.store
          ? {
            ...product.store,
            coupons: product.store.Coupon || [],
            Coupon: undefined,
          }
          : product.store,
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: ratings.length,
      };
    });

    return json({ products: productsWithSummary });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return json({ error: "Failed to fetch products" }, 500);
  }
}
