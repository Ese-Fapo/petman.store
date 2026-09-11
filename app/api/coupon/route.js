import authAdmin from "@/middlewares/authAdmin";
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API for admin/platform coupon management and buyer coupon validation at checkout.
const json = (body, status = 200) => NextResponse.json(body, { status });

const getSubscriptionAccess = async () => {
    const { userId, has } = await auth();

    return {
        userId: userId || null,
        // Membership-only coupons use Clerk plan checks instead of trusting client input.
        isPlusSubscriber: Boolean(userId && has({ plan: "plus" })),
    };
};

const hasExistingOrders = async (userId) => {
    if (!userId) {
        return false;
    }

    const orderCount = await prisma.order.count({
        where: { userId },
    });

    return orderCount > 0;
};

const getAdminAccess = async () => {
    const { userId } = await auth();

    return userId ? authAdmin(userId) : false;
};

const isPublicCoupon = (coupon) => coupon.isPublic || (!coupon.forNewUser && !coupon.forMember);

const validateCouponAccess = async (coupon, { userId, isPlusSubscriber }) => {
    if (!coupon || coupon.expiresAt <= new Date()) {
        return { error: "Coupon not found or expired", status: 404 };
    }

    if (coupon.forMember && !isPlusSubscriber) {
        return { error: "This coupon is only available for Plus subscribers", status: 403 };
    }

    if (coupon.forNewUser) {
        // New-customer coupons require sign-in so previous orders can be checked.
        if (!userId) {
            return { error: "Sign in to use this new customer coupon", status: 401 };
        }

        if (await hasExistingOrders(userId)) {
            return { error: "Coupon is only available for new customers", status: 403 };
        }
    }

    return null;
};

const parseCouponExpiry = (expiresAt) => {
    if (typeof expiresAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
        return new Date(`${expiresAt}T23:59:59.999Z`);
    }

    return new Date(expiresAt);
};

const normalizeCoupon = (coupon) => {
    const code = typeof coupon?.code === "string" ? coupon.code.trim().toUpperCase() : "";
    const description = typeof coupon?.description === "string" ? coupon.description.trim() : "";
    const discount = Number(coupon?.discount);
    const expiresAt = parseCouponExpiry(coupon?.expiresAt);
    const forNewUser = Boolean(coupon?.forNewUser);
    const forMember = Boolean(coupon?.forMember);
    const isPublic = Boolean(coupon?.isPublic) || (!forNewUser && !forMember);

    // Admin-created coupons must have a valid code, description, discount, and expiry date.
    if (!code || !description || !Number.isFinite(discount) || discount < 1 || discount > 100 || Number.isNaN(expiresAt.getTime())) {
        return null;
    }

    return {
        code,
        description,
        discount,
        forNewUser,
        forMember,
        isPublic,
        expiresAt,
        storeId: null,
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

        // Inngest handles expiry cleanup outside the request lifecycle.

        await inngest.send({
            name: "app/coupon.expired",
            data: {
                code: createdCoupon.code,
                expiresAt: createdCoupon.expiresAt.toISOString(),
            },
        });

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
export async function GET(request) {
    try {
        const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();

        if (code) {
            // When a code is supplied, this GET acts as a buyer-facing coupon validation endpoint.
            const access = await getSubscriptionAccess();
            const coupon = await prisma.coupon.findUnique({
                where: { code },
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                        },
                    },
                },
            });

            const couponAccessError = await validateCouponAccess(coupon, access);

            if (couponAccessError) {
                return json({ error: couponAccessError.error }, couponAccessError.status);
            }

            return json({
                message: "Coupon applied successfully",
                coupon: {
                    ...coupon,
                    isPublic: isPublicCoupon(coupon),
                },
            });
        }

        const isAdmin = await getAdminAccess();

        if (!isAdmin) {
            return json({ error: "Not authorized" }, 401);
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        return json({ coupons });
    } catch (error) {
        console.error("Failed to fetch coupons:", error);
        return json({ error: "Failed to fetch coupons" }, 500);
    }
}
