import { v2 as cloudinary } from "cloudinary";
import { cloudinarySignSchema, validateBody } from "@/lib/validations";
import { DEFAULT_CLOUDINARY_CLOUD_NAME, DEFAULT_CLOUDINARY_API_KEY } from "@/lib/constants";

const DEFAULT_CLOUDINARY_API_SECRET = "HQteYfBtJkadd8-i4rTd7eDlCs8";

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

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      DEFAULT_CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      DEFAULT_CLOUDINARY_API_KEY;

    // Use default verified secret if cloudName matches default account, or clean env secret
    const rawSecret = (process.env.CLOUDINARY_API_SECRET || "").trim().replace(/^["']|["']$/g, "");
    const apiSecret =
      cloudName === DEFAULT_CLOUDINARY_CLOUD_NAME
        ? DEFAULT_CLOUDINARY_API_SECRET
        : rawSecret || DEFAULT_CLOUDINARY_API_SECRET;

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
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