import { prisma } from "@/lib/prisma";

// Check whether the current user owns an approved and active store.
const authSeller = async (userId) => {
  if (!userId) {
    return false;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        isActive: true,
      },
    });

    if (store?.status === "approved" && store.isActive) {
      return store.id;
    }

    return false;
  } catch (error) {
    console.error("Failed to authorize seller:", error);
    return false;
  }
};

export default authSeller;
