import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users, allowedEmails } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      // Check if email is on the allowlist
      const allowed = await db
        .select()
        .from(allowedEmails)
        .where(eq(allowedEmails.email, email))
        .limit(1);

      if (allowed.length === 0) {
        // Not allowed — redirect to access-denied
        return "/access-denied";
      }

      // Upsert the user record
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const role = email === adminEmail ? "admin" : "user";
      const now = new Date().toISOString();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          id: user.id ?? email,
          email,
          name: user.name ?? null,
          image: user.image ?? null,
          role,
          createdAt: now,
        });
      }

      return true;
    },

    async jwt({ token, user: u, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (u?.email) {
        const email = u.email.toLowerCase();
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        token.role = dbUser[0]?.role ?? "user";
        token.dbId = dbUser[0]?.id ?? u.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).dbId = token.dbId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
});
