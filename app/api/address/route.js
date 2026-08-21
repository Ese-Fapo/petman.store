import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ADDRESS_FIELDS = ["name", "email", "street", "city", "state", "zip", "country", "phone"];

const json = (body, status = 200) => NextResponse.json(body, { status });

const getCurrentUserId = async () => {
  const { userId } = await auth();
  return userId || null;
};

const getRequiredText = (address, key) => {
  const value = address?.[key];
  return typeof value === "string" ? value.trim() : "";
};

const normalizeAddress = (address) => {
  const normalizedAddress = {};

  for (const field of ADDRESS_FIELDS) {
    normalizedAddress[field] = getRequiredText(address, field);
  }

  return normalizedAddress;
};

const validateAddress = (address) => {
  const normalizedAddress = normalizeAddress(address);
  const missingField = ADDRESS_FIELDS.find((field) => !normalizedAddress[field]);

  if (missingField) {
    return {
      error: `${missingField} is required`,
      address: normalizedAddress,
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedAddress.email)) {
    return {
      error: "Enter a valid email address",
      address: normalizedAddress,
    };
  }

  return {
    error: null,
    address: normalizedAddress,
  };
};

const ensureUserExists = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return Boolean(user);
};

// Get all addresses for the current user.
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return json({ addresses });
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return json({ error: "Failed to fetch addresses" }, 500);
  }
}

// Add a new address for the current user.
export async function POST(request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (!(await ensureUserExists(userId))) {
      return json({ error: "User not found" }, 404);
    }

    const { address } = await request.json();
    const validation = validateAddress(address);

    if (validation.error) {
      return json({ error: validation.error }, 400);
    }

    const newAddress = await prisma.address.create({
      data: {
        ...validation.address,
        userId,
      },
    });

    return json({
      message: "Address saved successfully",
      address: newAddress,
    }, 201);
  } catch (error) {
    console.error("Failed to save address:", error);
    return json({ error: "Failed to save address" }, 500);
  }
}

// Update an existing address owned by the current user.
export async function PUT(request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { addressId, address } = await request.json();

    if (!addressId || typeof addressId !== "string") {
      return json({ error: "Missing or invalid addressId" }, 400);
    }

    const validation = validateAddress(address);

    if (validation.error) {
      return json({ error: validation.error }, 400);
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
      select: { id: true },
    });

    if (!existingAddress) {
      return json({ error: "Address not found" }, 404);
    }

    const updatedAddress = await prisma.address.update({
      where: { id: existingAddress.id },
      data: validation.address,
    });

    return json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Failed to update address:", error);
    return json({ error: "Failed to update address" }, 500);
  }
}

// Delete an address owned by the current user.
export async function DELETE(request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { addressId } = await request.json();

    if (!addressId || typeof addressId !== "string") {
      return json({ error: "Missing or invalid addressId" }, 400);
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
      select: { id: true },
    });

    if (!existingAddress) {
      return json({ error: "Address not found" }, 404);
    }

    await prisma.address.delete({
      where: { id: existingAddress.id },
    });

    return json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return json({ error: "Failed to delete address" }, 500);
  }
}
