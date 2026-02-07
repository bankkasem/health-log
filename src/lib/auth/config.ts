import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { NextAuthOptions } from "next-auth";
import type { DatabaseUser } from "@/types/auth";
import { toUser } from "@/types/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email;
        const password = credentials.password;

        const { data: authUser, error: authError } =
          await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
          });

        if (authError || !authUser.user) {
          console.error("Supabase auth error:", authError);
          return null;
        }

        const { data: dbUser, error: userError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", authUser.user.id)
          .single<DatabaseUser>();

        if (userError || !dbUser) {
          console.error("Supabase user fetch error:", userError);
          return null;
        }

        return toUser(dbUser);
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // User is already created during signup, just verify they exist
      const { data: existingUser, error } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (error || !existingUser) {
        console.error("User not found in database:", error);
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      // On signin, populate token from user object
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.gender = user.gender;
        token.dateOfBirth = user.dateOfBirth;
        token.height = user.height;
      }

      // On update or periodic refresh, fetch fresh data from database
      if (trigger === "update" || !user) {
        if (token.id) {
          const { data: dbUser } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("id", token.id as string)
            .single<DatabaseUser>();

          if (dbUser) {
            const freshUser = toUser(dbUser);
            token.name = freshUser.name;
            token.picture = freshUser.image;
            token.gender = freshUser.gender;
            token.dateOfBirth = freshUser.dateOfBirth;
            token.height = freshUser.height;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.gender = token.gender as
          | "male"
          | "female"
          | "other"
          | undefined;
        session.user.dateOfBirth = token.dateOfBirth as string | undefined;
        session.user.height = token.height as number | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
