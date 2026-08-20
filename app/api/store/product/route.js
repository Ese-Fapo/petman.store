import { imagekit, imagekitUrlEndpoint } from "@/configs/imageKits";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 4;

// Keep JSON responses consistent across this route.
const json = (body, status = 200) => NextResponse.json(body, { status });

// Read and trim required text fields from multipart form data.
const getRequiredText = (formData, key) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

// Convert number fields from the form into safe positive numbers.
const getRequiredNumber = (formData, key) => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) && value > 0 ? value : null;
};

// Validate product images before uploading them to ImageKit.
const getProductImages = (formData, { required = true } = {}) => {
  const images = formData
    .getAll("images")
    .filter((image) => typeof File !== "undefined" && image instanceof File && image.size > 0);

  if (images.length < 1) {
    if (required) {
      throw new Error("MISSING_IMAGES");
    }

    return [];
  }

  if (images.length > MAX_PRODUCT_IMAGES) {
    throw new Error("TOO_MANY_IMAGES");
  }

  for (const image of images) {
    if (!image.type.startsWith("image/")) {
      throw new Error("INVALID_IMAGE_TYPE");
    }

    if (image.size > MAX_IMAGE_SIZE) {
      throw new Error("IMAGE_TOO_LARGE");
    }
  }

  return images;
};

// Clerk auth plus seller authorization.
const getSellerStoreId = async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return authSeller(userId);
};

// Preserve the original extension when ImageKit creates the uploaded file name.
const getImageExtension = (image) => {
  const extension = image.name?.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? `.${extension}` : "";
};

// Upload one product image to ImageKit and return its optimized delivery URL.
const uploadProductImage = async (image, storeId, index) => {
  if (!process.env.IMAGEKIT_PRIVATE_KEY || !imagekitUrlEndpoint) {
    throw new Error("IMAGEKIT_NOT_CONFIGURED");
  }

  const uploadedFile = await imagekit.files.upload({
    file: image,
    fileName: `${storeId}-product-${Date.now()}-${index}${getImageExtension(image)}`,
    folder: "/products",
    useUniqueFileName: true,
    transformation: {
      pre: "w-1024,c-maintain_ratio,q-auto,f-webp",
    },
  });

  if (!uploadedFile.filePath) {
    throw new Error("IMAGEKIT_UPLOAD_FAILED");
  }

  return {
    fileId: uploadedFile.fileId,
    url: imagekit.helper.buildSrc({
      urlEndpoint: imagekitUrlEndpoint,
      src: uploadedFile.filePath,
      transformation: [
        {
          width: 1024,
          crop: "maintain_ratio",
          quality: "auto",
          format: "webp",
        },
      ],
    }),
  };
};

// Avoid orphaned ImageKit files if database creation fails after upload.
const deleteUploadedImages = async (uploads) => {
  await Promise.allSettled(
    uploads.map((upload) => {
      if (!upload.fileId) {
        return Promise.resolve();
      }

      return imagekit.files.delete(upload.fileId);
    }),
  );
};

// Add a new product for the current seller.
export async function POST(request) {
  let uploadedImages = [];

  try {
    const storeId = await getSellerStoreId();

    if (!storeId) {
      return json({ error: "Not authorized" }, 401);
    }

    // Collect form fields from the add-product page.
    const formData = await request.formData();
    const name = getRequiredText(formData, "name");
    const description = getRequiredText(formData, "description");
    const category = getRequiredText(formData, "category");
    const mrp = getRequiredNumber(formData, "mrp");
    const price = getRequiredNumber(formData, "price");
    const images = getProductImages(formData, { required: true });

    if (!name || !description || !category || mrp === null || price === null) {
      return json({ error: "Missing product details" }, 400);
    }

    if (price > mrp) {
      return json({ error: "Offer price cannot be greater than actual price" }, 400);
    }

    // Upload product images to ImageKit before saving the product.
    for (const [index, image] of images.entries()) {
      const uploadedImage = await uploadProductImage(image, storeId, index + 1);
      uploadedImages.push(uploadedImage);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: uploadedImages.map((image) => image.url),
        storeId,
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
        createdAt: true,
      },
    });

    return json({
      message: "Product added successfully",
      product,
    }, 201);
  } catch (error) {
    // If anything fails after uploading images, remove those files from ImageKit.
    if (uploadedImages.length > 0) {
      await deleteUploadedImages(uploadedImages);
    }

    if (error.message === "MISSING_IMAGES") {
      return json({ error: "At least one product image is required" }, 400);
    }

    if (error.message === "TOO_MANY_IMAGES") {
      return json({ error: `You can upload up to ${MAX_PRODUCT_IMAGES} product images` }, 400);
    }

    if (error.message === "INVALID_IMAGE_TYPE") {
      return json({ error: "Product images must be image files" }, 400);
    }

    if (error.message === "IMAGE_TOO_LARGE") {
      return json({ error: "Each product image must be 5MB or smaller" }, 400);
    }

    if (error.message === "IMAGEKIT_NOT_CONFIGURED") {
      return json({ error: "ImageKit is not configured" }, 500);
    }

    if (error.message === "IMAGEKIT_UPLOAD_FAILED") {
      return json({ error: "Failed to upload product images" }, 502);
    }

    console.error("Failed to add product:", error);
    return json({ error: "Failed to add product" }, 500);
  }
}

// Update an existing product owned by the current seller.
export async function PUT(request) {
  let uploadedImages = [];

  try {
    const storeId = await getSellerStoreId();

    if (!storeId) {
      return json({ error: "Not authorized" }, 401);
    }

    const formData = await request.formData();
    const productId = getRequiredText(formData, "productId");
    const name = getRequiredText(formData, "name");
    const description = getRequiredText(formData, "description");
    const category = getRequiredText(formData, "category");
    const mrp = getRequiredNumber(formData, "mrp");
    const price = getRequiredNumber(formData, "price");
    const images = getProductImages(formData, { required: false });

    if (!productId || !name || !description || !category || mrp === null || price === null) {
      return json({ error: "Missing product details" }, 400);
    }

    if (price > mrp) {
      return json({ error: "Offer price cannot be greater than actual price" }, 400);
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
      select: {
        id: true,
        images: true,
      },
    });

    if (!existingProduct) {
      return json({ error: "Product not found" }, 404);
    }

    for (const [index, image] of images.entries()) {
      const uploadedImage = await uploadProductImage(image, storeId, index + 1);
      uploadedImages.push(uploadedImage);
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        mrp,
        price,
        category,
        ...(uploadedImages.length > 0
          ? { images: uploadedImages.map((image) => image.url) }
          : {}),
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteUploadedImages(uploadedImages);
    }

    if (error.message === "TOO_MANY_IMAGES") {
      return json({ error: `You can upload up to ${MAX_PRODUCT_IMAGES} product images` }, 400);
    }

    if (error.message === "INVALID_IMAGE_TYPE") {
      return json({ error: "Product images must be image files" }, 400);
    }

    if (error.message === "IMAGE_TOO_LARGE") {
      return json({ error: "Each product image must be 5MB or smaller" }, 400);
    }

    if (error.message === "IMAGEKIT_NOT_CONFIGURED") {
      return json({ error: "ImageKit is not configured" }, 500);
    }

    if (error.message === "IMAGEKIT_UPLOAD_FAILED") {
      return json({ error: "Failed to upload product images" }, 502);
    }

    console.error("Failed to update product:", error);
    return json({ error: "Failed to update product" }, 500);
  }
}

// Get all products owned by the current seller.
export async function GET() {
  try {
    const storeId = await getSellerStoreId();

    if (!storeId) {
      return json({ error: "Not authorized" }, 401);
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return json({ products });
  } catch (error) {
    console.error("Failed to fetch seller products:", error);
    return json({ error: "Failed to fetch seller products" }, 500);
  }
}
