/**
 * Image optimization utility for Monetra.
 * Automatically enables modern formats (WebP/AVIF), smart compression,
 * and responsive dimension scaling for Cloudinary and Unsplash CDNs.
 */

export function optimizeImage(url, options = {}) {
  if (!url || typeof url !== "string") return url || "/images/donation.webp";

  const { width, quality = "auto", format = "auto" } = options;

  // 1. Cloudinary optimization
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Check if URL already has f_auto or transformations right after /upload/
    const uploadIndex = url.indexOf("/upload/");
    const afterUpload = url.slice(uploadIndex + 8);

    // If it doesn't already have f_auto or transformations:
    if (!afterUpload.startsWith("f_") && !afterUpload.startsWith("w_") && !afterUpload.startsWith("c_")) {
      const transforms = [];
      if (format) transforms.push(`f_${format}`);
      if (quality) transforms.push(`q_${quality}`);
      if (width) transforms.push(`w_${width},c_limit`);

      const prefix = url.slice(0, uploadIndex + 8);
      return `${prefix}${transforms.join(",")}/${afterUpload}`;
    }
    return url;
  }

  // 2. Unsplash CDN optimization
  if (url.includes("images.unsplash.com")) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set("auto", "format");
      parsedUrl.searchParams.set("fit", "crop");
      if (width) parsedUrl.searchParams.set("w", String(width));
      parsedUrl.searchParams.set("q", quality === "auto" ? "80" : String(quality));
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  return url;
}
