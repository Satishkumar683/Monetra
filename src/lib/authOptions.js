import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

if (process.env.NODE_ENV === "development") {
  // If NEXTAUTH_URL was accidentally set to the production vercel domain in .env.local,
  // override it to localhost so local debugging doesn't redirect to Vercel
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("vercel.app")) {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
}

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  debug: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user?.email) {
          console.error("SignIn error: No email returned from provider", { account, user });
          return false;
        }

        await connectDB();

        const existingUser = await User.findOne({
          email: user.email,
        });

        if (!existingUser) {
          let baseUsername = user.email
            .split("@")[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

          if (!baseUsername) {
            baseUsername = "user";
          }

          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter++}`;
          }

          const adminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          const initialRole = adminEmails.includes(user.email.toLowerCase()) ? "admin" : "user";

          await User.create({
            name: user.name || baseUsername,
            email: user.email,
            image: user.image || "",
            username,
            role: initialRole,
          });
        } else {
          const adminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          if (adminEmails.includes(user.email.toLowerCase()) && existingUser.role !== "admin") {
            existingUser.role = "admin";
            await existingUser.save();
          }

          if (user?.image && existingUser.image !== user.image) {
            // Keep google/oauth avatar updated and purge legacy base64 strings
            existingUser.image = user.image;
            await existingUser.save();
          }
        }

        return true;
      } catch (err) {
        console.error("SignIn callback error details:", err);
        return false;
      }
    },

  async jwt({ token, user }) {
  const email = user?.email || token?.email;

  if (!email) return token;

  try {
    await connectDB();

    const dbUser = await User.findOne({ email });

    if (dbUser) {
      token.id = dbUser._id.toString();
      token.name = dbUser.name;
      token.email = dbUser.email;
      
      // CRITICAL: Never put data: base64 in cookie to prevent 431 header overflow
      const rawImage = dbUser.image || user?.image || token.picture || "";
      token.image = (typeof rawImage === "string" && !rawImage.startsWith("data:") && rawImage.length < 1000)
        ? rawImage
        : (typeof user?.image === "string" && !user.image.startsWith("data:") && user.image.length < 1000)
          ? user.image
          : "";

      token.bio = dbUser.bio;
      token.city = dbUser.city;
      token.country = dbUser.country;

      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const isEnvAdmin = adminEmails.includes(dbUser.email.toLowerCase());
      token.role = isEnvAdmin || dbUser.role === "admin" ? "admin" : "user";

      token.createdAt = dbUser.createdAt;
    }
  } catch (error) {
    console.error("JWT callback error:", error);
  }

  return token;
},

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
      session.user.bio = token.bio;
      session.user.city = token.city;
      session.user.country = token.country;
      session.user.role = token.role || "user";
      session.user.createdAt = token.createdAt;
    }

    return session;
  },
},
};