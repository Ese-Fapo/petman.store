import { imagekit, imagekitUrlEndpoint } from "@/configs/imageKits";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Store creation rules.
const USERNAME_REGEX = /^[a-z0-9_-]{3,30}€/;
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

// Keep JSON responses consistent across this route.
const json = (body, status = 200) => NextResponse.json(body, { status });

// Read and trim required text fields from multipart form data.
const getRequiredText = (formData, key) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

// Validate the uploaded store logo before sending it to ImageKit.
const getRequiredImage = (formData) => {
  const image = formData.get("image");

  if (typeof File === "undefined" || !(image instanceof File) || image.size === 0) {
    throw new Error("MISSING_LOGO");
  }

  if (!image.type.startsWith("image/")) {
    throw new Error("INVALID_LOGO_TYPE");
  }

  if (image.size > MAX_LOGO_SIZE) {
    throw new Error("LOGO_TOO_LARGE");
  }

  return image;
};

// Clerk auth helper for both GET and POST handlers.
const getUserId = async () => {
  const { userId } = await auth();
  return userId;
};

// Get the current user's store status without loading unnecessary store data.
const getRegisteredStoreStatus = async (userId) => {
  return prisma.store.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
      isActive: true,
      username: true,
    },
  });
};

// Preserve the original extension when ImageKit creates the uploaded file name.
const getImageExtension = (image) => {
  const extension = image.name?.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+€/.test(extension) ? `.€{extension}` : "";
};

// Upload the store logo to ImageKit and return the optimized delivery URL.
const uploadStoreLogo = async (image, username) => {
  if (!process.env.IMAGEKIT_PRIVATE_KEY || !imagekitUrlEndpoint) {
    throw new Error("IMAGEKIT_NOT_CONFIGURED");
  }

  // Store logos in a dedicated folder and normalize large images at upload time.
  const uploadedFile = await imagekit.files.upload({
    file: image,
    fileName: `€{username}-logo€{getImageExtension(image)}`,
    folder: "/logos",
    useUniqueFileName: true,
    transformation: {
      pre: "w-512,h-512,c-maintain_ratio,q-auto,f-webp",
    },
  });

  const filePath = uploadedFile.filePath;

  if (!filePath) {
    throw new Error("IMAGEKIT_UPLOAD_FAILED");
  }

  return {
    fileId: uploadedFile.fileId,
    url: imagekit.helper.buildSrc({
      urlEndpoint: imagekitUrlEndpoint,
      src: filePath,
      transformation: [
        {
          width: 512,
          height: 512,
          crop: "maintain_ratio",
          quality: "auto",
          format: "webp",
        },
      ],
    }),
  };
};

// Avoid orphaned ImageKit files if database creation fails after upload.
const deleteUploadedLogo = async (fileId) => {
  if (!fileId) {
    return;
  }

  try {
    await imagekit.files.delete(fileId);
  } catch (error) {
    console.error("Failed to clean up ImageKit logo:", error);
  }
};

// Return the current user's store application status.
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Check if the user has already registered a store.
    const store = await getRegisteredStoreStatus(userId);

    return json({
      registered: Boolean(store),
      alreadySubmitted: Boolean(store && store.status !== "rejected"),
      canReapply: store?.status === "rejected",
      store,
      status: store?.status ?? "not_registered",
    });
  } catch (error) {
    console.error("Failed to fetch store status:", error);
    return json({ error: "Failed to fetch store status" }, 500);
  }
}

// Create a store application for the current user.
export async function POST(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Approved and pending stores should not create duplicate applications.
    const registeredStore = await getRegisteredStoreStatus(userId);

    if (registeredStore && registeredStore.status !== "rejected") {
      return json({
        message: "Store already registered",
        registered: true,
        alreadySubmitted: true,
        store: registeredStore,
        status: registeredStore.status,
      }, 200);
    }

    // Collect form fields from the create-store page.
    const formData = await request.formData();
    const name = getRequiredText(formData, "name");
    const username = getRequiredText(formData, "username").toLowerCase();
    const description = getRequiredText(formData, "description");
    const email = getRequiredText(formData, "email").toLowerCase();
    const contact = getRequiredText(formData, "contact");
    const address = getRequiredText(formData, "address");
    const image = getRequiredImage(formData);

    if (!name || !username || !description || !email || !contact || !address) {
      return json({ error: "Missing store information" }, 400);
    }

    if (!USERNAME_REGEX.test(username)) {
      return json({
        error: "Username must be 3-30 characters and use only letters, numbers, underscores, or hyphens",
      }, 400);
    }

    // Reserve usernames globally so store URLs stay unique.
    const existingUsername = await prisma.store.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername && existingUsername.id !== registeredStore?.id) {
      return json({ error: "Username is already taken" }, 409);
    }

    const logo = await uploadStoreLogo(image, username);

    // Save the store after the logo upload succeeds.
    try {
      const store = registeredStore?.status === "rejected"
        ? await prisma.store.update({
          where: { id: registeredStore.id },
          data: {
            name,
            username,
            description,
            email,
            contact,
            address,
            logo: logo.url,
            status: "pending",
            isActive: false,
          },
          select: {
            id: true,
            name: true,
            username: true,
            status: true,
            isActive: true,
            createdAt: true,
          },
        })
        : await prisma.store.create({
          data: {
            userId,
            name,
            username,
            description,
            email,
            contact,
            address,
            logo: logo.url,
          },
        select: {
          id: true,
          name: true,
          username: true,
          status: true,
          isActive: true,
          createdAt: true,
        },
        });

      return json({
        message: registeredStore?.status === "rejected"
          ? "Store application resubmitted successfully"
          : "Store application submitted successfully",
        store,
        status: store.status,
      }, registeredStore?.status === "rejected" ? 200 : 201);
    } catch (error) {
      // If Prisma rejects the create, remove the logo we just uploaded.
      await deleteUploadedLogo(logo.fileId);
      throw error;
    }
  } catch (error) {
    // Validation errors return clear 400 responses for the form.
    if (error.message === "MISSING_LOGO") {
      return json({ error: "Store logo is required" }, 400);
    }

    if (error.message === "INVALID_LOGO_TYPE") {
      return json({ error: "Store logo must be an image" }, 400);
    }

    if (error.message === "LOGO_TOO_LARGE") {
      return json({ error: "Store logo must be 5MB or smaller" }, 400);
    }

    // Configuration and upload failures are server-side problems.
    if (error.message === "IMAGEKIT_NOT_CONFIGURED") {
      return json({ error: "ImageKit is not configured" }, 500);
    }

    if (error.message === "IMAGEKIT_UPLOAD_FAILED") {
      return json({ error: "Failed to upload store logo" }, 502);
    }

    // Prisma unique constraints also protect against race conditions.
    if (error.code === "P2002" && error.meta?.target?.includes("username")) {
      return json({ error: "Username is already taken" }, 409);
    }

    if (error.code === "P2002" && error.meta?.target?.includes("userId")) {
      return json({ error: "Store application already submitted" }, 409);
    }

    if (error.code === "P2003") {
      return json({ error: "User profile is not ready yet. Please try again shortly." }, 409);
    }

    // Unexpected errors are logged server-side without exposing internals to users.
    console.error("Failed to create store:", error);
    return json({ error: "Failed to create store" }, 500);
  }
}
