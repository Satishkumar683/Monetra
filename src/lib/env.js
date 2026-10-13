// Environment variable validation
// Import this at the top of next.config.mjs to fail fast on missing vars

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
      `   Add it to your .env.local file.`
    );
  }
  return value;
}

// Only validate server-side env vars (NEXT_PUBLIC_ vars are checked at build time)
export function validateEnv() {
  const required = [
    "MONGODB_URI",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "GITHUB_ID",
    "GITHUB_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables:");
    missing.forEach((name) => console.error(`   - ${name}`));
    console.error("\n   Add them to your .env.local file.\n");
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };
}
