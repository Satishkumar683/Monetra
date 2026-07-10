import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

     GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
   async signIn({ user }) {
  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: user.email,
    });

    if (!existingUser) {
      await User.create({
        name: user.name,
        email: user.email,
        image: user.image, // keep only URL, not base64
      });
    }

    return true;

  } catch (err) {
    console.error("SignIn error:", err);
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
    }

  } catch (error) {
    console.error("JWT callback error:", error);
  }

  return token;
},

  async session({ session, token }) {

  if (token) {
    session.user.id = token.id;
  }

  return session;
},
  },
};