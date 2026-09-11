import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public product detail API for one purchasable product.
const json = (body, status = 200) => NextResponse.json(body, { status });

// Get one public product from an approved and active store.
export async function GET(_request, { params }) {
  try {
    const { productId } = await params;

    if (!productId || typeof productId !== "string") {
      return json({ error: "Missing productId" }, 400);
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
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
          orderBy: { createdAt: "desc" },
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
    });

    if (!product) {
      return json({ error: "Product not found" }, 404);
    }

    // Return summary fields alongside raw reviews for product detail and review tabs.
    const ratings = Array.isArray(product.rating) ? product.rating : [];
    const averageRating = ratings.length
      ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length
      : 0;

    return json({
      product: {
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
      },
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return json({ error: "Failed to fetch product" }, 500);
  }
}
