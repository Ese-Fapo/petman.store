import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

const normalizeCart = (cart) => {
  if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(cart)
      .map(([productId, quantity]) => [productId, Number(quantity)])
      .filter(([productId, quantity]) =>
        typeof productId === "string" &&
        productId.length > 0 &&
        Number.isInteger(quantity) &&
        quantity > 0,
      ),
  );
};

const getCurrentUserId = async () => {
  const { userId } = await auth();
  return userId || null;
};

// Save the current user's cart.
export async function POST(request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { cart } = await request.json();
    const normalizedCart = normalizeCart(cart);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return json({ error: "User not found" }, 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cart: normalizedCart },
    });

    return json({
      message: "Cart updated",
      cart: normalizedCart,
    });
  } catch (error) {
    console.error("Failed to update cart:", error);
    return json({ error: "Failed to update cart" }, 500);
  }
}

// Get the current user's cart.
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cart: true },
    });

    if (!user) {
      return json({ error: "User not found" }, 404);
    }

    return json({ cart: normalizeCart(user.cart) });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return json({ error: "Failed to fetch cart" }, 500);
  }
}
