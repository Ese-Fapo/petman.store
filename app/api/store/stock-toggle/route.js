import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Keep JSON responses consistent across this route.
const json = (body, status = 200) => NextResponse.json(body, { status });

// Toggle stock for one product owned by the current seller.
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return json({ error: "Not authorized" }, 401);
    }

    const { productId } = await request.json();

    if (!productId || typeof productId !== "string") {
      return json({ error: "Missing or invalid productId" }, 400);
    }

    // Check if the product exists and belongs to the seller's store.
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
      select: {
        id: true,
        inStock: true,
      },
    });

    if (!product) {
      return json({ error: "Product not found" }, 404);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        inStock: !product.inStock,
      },
      select: {
        id: true,
        inStock: true,
      },
    });

    return json({
      message: "Product stock updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Failed to toggle product stock:", error);
    return json({ error: "Failed to toggle product stock" }, 500);
  }
}
