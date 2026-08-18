import { imagekit, imagekitUrlEndpoint } from "@/configs/imageKits";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

const json = (body, status = 200) => NextResponse.json(body, { status });

const getRequiredText = (formData, key) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

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

const getUserId = async () => {
  const { userId } = await auth();
  return userId;
};

const getImageExtension = (image) => {
  const extension = image.name?.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? `.${extension}` : "";
};

const uploadStoreLogo = async (image, username) => {
  if (!process.env.IMAGEKIT_PRIVATE_KEY || !imagekitUrlEndpoint) {
    throw new Error("IMAGEKIT_NOT_CONFIGURED");
  }

  const uploadedFile = await imagekit.files.upload({
    file: image,
    fileName: `${username}-logo${getImageExtension(image)}`,
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

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

    const store = await prisma.store.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        isActive: true,
        username: true,
      },
    });

    return json({
      alreadySubmitted: Boolean(store),
      store,
      status: store?.status ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch store status:", error);
    return json({ error: "Failed to fetch store status" }, 500);
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return json({ error: "Unauthorized" }, 401);
    }

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

    const existingStore = await prisma.store.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        isActive: true,
        username: true,
      },
    });

    if (existingStore) {
      return json({
        message: "Store application already submitted",
        store: existingStore,
        status: existingStore.status,
      }, 409);
    }

    const existingUsername = await prisma.store.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      return json({ error: "Username is already taken" }, 409);
    }

    const logo = await uploadStoreLogo(image, username);

    try {
      const store = await prisma.store.create({
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
        message: "Store application submitted successfully",
        store,
        status: store.status,
      }, 201);
    } catch (error) {
      await deleteUploadedLogo(logo.fileId);
      throw error;
    }
  } catch (error) {
    if (error.message === "MISSING_LOGO") {
      return json({ error: "Store logo is required" }, 400);
    }

    if (error.message === "INVALID_LOGO_TYPE") {
      return json({ error: "Store logo must be an image" }, 400);
    }

    if (error.message === "LOGO_TOO_LARGE") {
      return json({ error: "Store logo must be 5MB or smaller" }, 400);
    }

    if (error.message === "IMAGEKIT_NOT_CONFIGURED") {
      return json({ error: "ImageKit is not configured" }, 500);
    }

    if (error.message === "IMAGEKIT_UPLOAD_FAILED") {
      return json({ error: "Failed to upload store logo" }, 502);
    }

    if (error.code === "P2002" && error.meta?.target?.includes("username")) {
      return json({ error: "Username is already taken" }, 409);
    }

    if (error.code === "P2002" && error.meta?.target?.includes("userId")) {
      return json({ error: "Store application already submitted" }, 409);
    }

    if (error.code === "P2003") {
      return json({ error: "User profile is not ready yet. Please try again shortly." }, 409);
    }

    console.error("Failed to create store:", error);
    return json({ error: "Failed to create store" }, 500);
  }
}
