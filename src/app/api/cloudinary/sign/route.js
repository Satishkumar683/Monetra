import { v2 as cloudinary } from "cloudinary";
import { cloudinarySignSchema, validateBody } from "@/lib/validations";

import { DEFAULT_CLOUDINARY_CLOUD_NAME, DEFAULT_CLOUDINARY_API_KEY } from "@/lib/constants";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  DEFAULT_CLOUDINARY_CLOUD_NAME;

const apiKey =
  process.env.CLOUDINARY_API_KEY ||
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
  DEFAULT_CLOUDINARY_API_KEY;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const validation = validateBody(cloudinarySignSchema, body);
    if (!validation.success) {
      return Response.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }
    const { paramsToSign } = validation.data;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return Response.json({
      signature,
      apiKey,
      cloudName,
    });
  } catch (error) {
    console.error("Cloudinary signing error:", error);

    return Response.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}