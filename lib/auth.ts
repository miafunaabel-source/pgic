import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@/types/next-auth";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limiter";
import { findUserByEmail } from "@/lib/userStore";

const credentialsSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.email.toLowerCase();

        const rateCheck = await checkRateLimit(identifier);
        if (!rateCheck.allowed) {
          const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
          throw new Error(`RATE_LIMIT:${minutes}`);
        }

        const user = await findUserByEmail(identifier);
        if (!user) {
          await bcrypt.compare(parsed.data.password, "$2a$12$invalidhashfortimingnormalization");
          await recordFailedAttempt(identifier);
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          await recordFailedAttempt(identifier);
          return null;
        }

        await resetAttempts(identifier);
        return { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company, setupComplete: user.setupComplete ?? false };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id as string;
        token.company = (user as any).company ?? null;
        token.setupComplete = (user as any).setupComplete ?? false;
      }
      if (trigger === "update" && session?.setupComplete !== undefined) {
        token.setupComplete = session.setupComplete;
      }
      if (!user && token.email && token.iat) {
        const dbUser = await findUserByEmail(token.email as string);
        if (dbUser?.passwordChangedAt) {
          const changedAtMs = new Date(dbUser.passwordChangedAt).getTime();
          if (changedAtMs > (token.iat as number) * 1000) {
            throw new Error("session_invalidated");
          }
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as Role;
        session.user.company = token.company as Record<string, string> | undefined;
        session.user.setupComplete = token.setupComplete;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
    updateAge: 5 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
