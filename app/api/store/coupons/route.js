import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API for sellers to create, list, and delete coupons for their own store only.
const json = (body, status = 200) => NextResponse.json(body, { status });

const getSellerStoreId = async () => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // authSeller confirms the user owns an approved and active store.
    return authSeller(userId);
};

const parseCouponExpiry = (expiresAt) => {
    if (typeof expiresAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
        return new Date(`${expiresAt}T23:59:59.999Z`);
    }

    return new Date(expiresAt);
};

const normalizeCoupon = (coupon, storeId) => {
    const code = typeof coupon?.code === "string" ? coupon.code.trim().toUpperCase() : "";
    const description = typeof coupon?.description === "string" ? coupon.description.trim() : "";
    const discount = Number(coupon?.discount);
    const expiresAt = parseCouponExpiry(coupon?.expiresAt);
    const isPublic = Boolean(coupon?.isPublic);

    // Seller coupons are store-specific, so membership/new-user flags stay platform-admin only.
    if (!code || !description || !Number.isFinite(discount) || discount < 1 || discount > 100 || Number.isNaN(expiresAt.getTime())) {
        return null;
    }

    return {
        code,
        description,
        discount,
        expiresAt,
        isPublic,
        forNewUser: false,
        forMember: false,
        storeId,
    };
};

// List coupons owned by the current seller's store.
export async function GET() {
    try {
        const storeId = await getSellerStoreId();

        if (!storeId) {
            return json({ error: "Not authorized" }, 401);
        }

        const coupons = await prisma.coupon.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });

        return json({ coupons });
    } catch (error) {
        console.error("Failed to fetch seller coupons:", error);
        return json({ error: "Failed to fetch seller coupons" }, 500);
    }
}

// Create a coupon that can only discount this seller's order in a multi-store checkout.
export async function POST(request) {
    try {
        const storeId = await getSellerStoreId();

        if (!storeId) {
            return json({ error: "Not authorized" }, 401);
        }

        const { coupon } = await request.json();
        const normalizedCoupon = normalizeCoupon(coupon, storeId);

        if (!normalizedCoupon) {
            return json({ error: "Missing or invalid coupon details" }, 400);
        }

        const createdCoupon = await prisma.coupon.create({ data: normalizedCoupon });

        // Coupon expiry deletion is handled asynchronously by Inngest.
        await inngest.send({
            name: "app/coupon.expired",
            data: {
                code: createdCoupon.code,
                expiresAt: createdCoupon.expiresAt.toISOString(),
            },
        });

        return json({
            message: "Coupon created successfully",
            coupon: createdCoupon,
        }, 201);
    } catch (error) {
        if (error.code === "P2002") {
            return json({ error: "Coupon code already exists" }, 409);
        }

        console.error("Failed to create seller coupon:", error);
        return json({ error: "Failed to create seller coupon" }, 500);
    }
}

// Delete one coupon owned by the current seller's store.
export async function DELETE(request) {
    try {
        const storeId = await getSellerStoreId();

        if (!storeId) {
            return json({ error: "Not authorized" }, 401);
        }

        const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();

        if (!code) {
            return json({ error: "Missing coupon code" }, 400);
        }

        const deleted = await prisma.coupon.deleteMany({
            where: {
                code,
                storeId,
            },
        });

        if (deleted.count === 0) {
            return json({ error: "Coupon not found" }, 404);
        }

        return json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Failed to delete seller coupon:", error);
        return json({ error: "Failed to delete seller coupon" }, 500);
    }
}
