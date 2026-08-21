import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
          },
        },
      },
    });

    if (!product) {
      return json({ error: "Product not found" }, 404);
    }

    return json({ product });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return json({ error: "Failed to fetch product" }, 500);
  }
}
