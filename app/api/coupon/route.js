import authAdmin from "@/middlewares/authAdmin";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const json = (body, status = 200) => NextResponse.json(body, { status });

const getAdminAccess = async () => {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    return authAdmin(userId);
};

const normalizeCoupon = (coupon) => {
    const code = typeof coupon?.code === "string" ? coupon.code.trim().toUpperCase() : "";
    const description = typeof coupon?.description === "string" ? coupon.description.trim() : "";
    const discount = Number(coupon?.discount);
    const expiresAt = new Date(coupon?.expiresAt);

    if (!code || !description || !Number.isFinite(discount) || discount < 1 || discount > 100 || Number.isNaN(expiresAt.getTime())) {
        return null;
    }

    return {
        code,
        description,
        discount,
        forNewUser: Boolean(coupon?.forNewUser),
        forMember: Boolean(coupon?.forMember),
        isPublic: Boolean(coupon?.isPublic),
        expiresAt,
    };
};

// Add a new coupon.
export async function POST(request) {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const { coupon } = await request.json();
        const normalizedCoupon = normalizeCoupon(coupon);

        if (!normalizedCoupon) {
            return json({ error: "Missing or invalid coupon details" }, 400);
        }

        const createdCoupon = await prisma.coupon.create({ data: normalizedCoupon });

        return json({ message: "Coupon added successfully", coupon: createdCoupon }, 201);
    } catch (error) {
        if (error.code === "P2002") {
            return json({ error: "Coupon code already exists" }, 409);
        }

        console.error("Failed to add coupon:", error);
        return json({ error: "Failed to add coupon" }, 500);
    }
}

// Delete coupon /api/coupon?code=COUPONCODE.
export async function DELETE(request) {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();

        if (!code) {
            return json({ error: "Missing coupon code" }, 400);
        }

        await prisma.coupon.delete({ where: { code } });

        return json({ message: "Coupon deleted successfully" });
    } catch (error) {
        if (error.code === "P2025") {
            return json({ error: "Coupon not found" }, 404);
        }

        console.error("Failed to delete coupon:", error);
        return json({ error: "Failed to delete coupon" }, 500);
    }
}

// Get all coupons for admin management.
export async function GET() {
    try {
        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
        });

        return json({ coupons });
    } catch (error) {
        console.error("Failed to fetch coupons:", error);
        return json({ error: "Failed to fetch coupons" }, 500);
    }
}
