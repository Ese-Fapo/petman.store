import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API for verified-purchase product reviews.
const json = (body, status = 200) => NextResponse.json(body, { status });

const ratingSelect = {
    id: true,
    rating: true,
    review: true,
    userId: true,
    productId: true,
    orderId: true,
    createdAt: true,
    updatedAt: true,
    user: {
        select: {
            name: true,
            image: true,
        },
    },
};

const cleanReview = (review) => (
    typeof review === "string" ? review.trim().replace(/\s+/g, " ") : ""
);

// Rating summaries are returned with writes so the UI can refresh product totals without a second request.
const getRatingSummary = async (productId) => {
    const [aggregate, count] = await Promise.all([
        prisma.rating.aggregate({
            where: { productId },
            _avg: { rating: true },
        }),
        prisma.rating.count({
            where: { productId },
        }),
    ]);

    return {
        averageRating: Number((aggregate._avg.rating || 0).toFixed(1)),
        reviewCount: count,
    };
};

// Return the current buyer's ratings so order/product screens can suppress duplicate prompts.
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const ratings = await prisma.rating.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: ratingSelect,
        });

        return json({ ratings });
    } catch (error) {
        console.error("Failed to fetch ratings:", error);
        return json({ error: "Failed to fetch ratings" }, 500);
    }
}

// Create or update a verified-purchase product rating.
export async function POST(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return json({ error: "Unauthorized" }, 401);
        }

        const { orderId, productId, rating, review } = await request.json();
        const numericRating = Number(rating);
        const normalizedReview = cleanReview(review);

        if (!orderId || typeof orderId !== "string") {
            return json({ error: "Missing or invalid orderId" }, 400);
        }

        if (!productId || typeof productId !== "string") {
            return json({ error: "Missing or invalid productId" }, 400);
        }

        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return json({ error: "Select a rating between 1 and 5" }, 400);
        }

        if (normalizedReview.length < 5 || normalizedReview.length > 1000) {
            return json({ error: "Review must be between 5 and 1000 characters" }, 400);
        }

        const orderItem = await prisma.orderItem.findFirst({
            where: {
                orderId,
                productId,
                order: {
                    userId,
                    status: "DELIVERED",
                },
            },
            select: {
                orderId: true,
                productId: true,
            },
        });

        if (!orderItem) {
            return json({ error: "Only delivered purchased products can be reviewed" }, 403);
        }

        // The unique key lets a buyer edit their review for the same product/order instead of duplicating it.
        const savedRating = await prisma.rating.upsert({
            where: {
                userId_productId_orderId: {
                    userId,
                    productId,
                    orderId,
                },
            },
            create: {
                userId,
                productId,
                orderId,
                rating: numericRating,
                review: normalizedReview,
            },
            update: {
                rating: numericRating,
                review: normalizedReview,
            },
            select: ratingSelect,
        });

        return json({
            message: "Rating submitted successfully",
            rating: savedRating,
            summary: await getRatingSummary(productId),
        }, 201);
    } catch (error) {
        console.error("Failed to submit rating:", error);
        return json({ error: "Failed to submit rating" }, 500);
    }
}
