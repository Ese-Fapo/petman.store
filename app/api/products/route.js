import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
      include: {
        rating: {
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
      orderBy: { createdAt: "desc" },
    });

    return json({ products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return json({ error: "Failed to fetch products" }, 500);
  }
}
