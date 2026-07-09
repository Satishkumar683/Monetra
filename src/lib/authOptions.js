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
      return true;
  // try {
  //   console.log("========== SIGN IN START ==========");

  //   console.log("Connecting DB...");
  //   await connectDB();
  //   console.log("DB Connected");

  //   console.log("Finding user:", user.email);

  //   const existingUser = await User.findOne({
  //     email: user.email,
  //   });

  //   console.log("Existing User:", existingUser);

  //   if (!existingUser) {
  //     console.log("Creating new user...");

  //     await User.create({
  //       name: user.name,
  //       email: user.email,
  //       image: user.image,
  //       username: user.email.split("@")[0],
  //     });

  //     console.log("User created successfully");
  //   }

  //   console.log("Returning TRUE");
  //   return true;
  // } catch (error) {
  //   console.error("========== SIGN IN ERROR ==========");
  //   console.error(error);
  //   console.error(error.stack);
  //   return false;
  // }
},
        

      
  
     
   

    async jwt({ token, user }) {
      // On initial sign-in, "user" is available; on later requests it isn't,
      // so we always fall back to the email already stored on the token.
      const email = user?.email || token?.email;
      if (!email) return token;

      try {
        await connectDB();
        const dbUser = await User.findOne({ email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.image = dbUser.image;
          token.bio = dbUser.bio;
          token.city = dbUser.city;
          token.country = dbUser.country;
          token.createdAt = dbUser.createdAt;
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.bio = token.bio;
        session.user.city = token.city;
        session.user.country = token.country;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
};