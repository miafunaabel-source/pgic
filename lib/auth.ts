import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@/types/next-auth";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limiter";
import { dashboardAccess, findUserByEmail, findUserByEmailStrict } from "@/lib/userStore";
import { DEMO_USER, DEMO_USER_ID, isDemoEnabled } from "@/lib/demo";

// Codes d'erreur renvoyés à la page de connexion (affichés en clair par app/login/page.tsx)
export const LOGIN_ERRORS = {
  serviceUnavailable: "SERVICE_UNAVAILABLE",
  paymentPending: "SUBSCRIPTION_PENDING",
  subscriptionInactive: "SUBSCRIPTION_INACTIVE",
} as const;

function clientIp(req: { headers?: Record<string, unknown> } | undefined): string {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return typeof value === "string" ? value.split(",")[0].trim() : "unknown";
}

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
      async authorize(credentials, req) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        // Limite par couple email + IP : un tiers ne peut pas bloquer le compte d'un client depuis une autre IP.
        const identifier = `login:${email}:${clientIp(req)}`;

        const rateCheck = await checkRateLimit(identifier);
        if (!rateCheck.allowed) {
          const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
          throw new Error(`RATE_LIMIT:${minutes}`);
        }

        let user;
        try {
          user = await findUserByEmailStrict(email);
        } catch (err) {
          console.error("[auth] base indisponible:", err instanceof Error ? err.message : err);
          throw new Error(LOGIN_ERRORS.serviceUnavailable);
        }
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

        // Identifiants corrects : on indique précisément pourquoi l'accès est refusé (jamais avant).
        const access = dashboardAccess(user);
        if (access === "payment_pending") throw new Error(LOGIN_ERRORS.paymentPending);
        if (access === "subscription_inactive") throw new Error(LOGIN_ERRORS.subscriptionInactive);

        return { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company, setupComplete: user.setupComplete ?? false };
      },
    }),
    // Accès démo sans mot de passe — session en lecture seule (voir middleware)
    CredentialsProvider({
      id: "demo",
      name: "demo",
      credentials: {},
      async authorize() {
        if (!isDemoEnabled()) return null;
        return { ...DEMO_USER };
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
      if (!user && token.email && token.iat && token.id !== DEMO_USER_ID) {
        // Lecture tolérante : une panne Redis passagère ne déconnecte jamais un client.
        const dbUser = await findUserByEmail(token.email as string);
        if (dbUser?.passwordChangedAt) {
          const changedAtMs = new Date(dbUser.passwordChangedAt).getTime();
          if (changedAtMs > (token.iat as number) * 1000) {
            throw new Error("session_invalidated");
          }
        }
        // Abonnement résilié ou impayé depuis la connexion : la session est fermée.
        if (dbUser && dashboardAccess(dbUser) !== "ok") {
          throw new Error("subscription_inactive");
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
