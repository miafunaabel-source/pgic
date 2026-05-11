import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@/types/next-auth";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limiter";

// Comptes de démonstration — en production, ces utilisateurs seront en base PostgreSQL
// avec passwordHash généré par bcrypt.hash(password, 12)
const DEMO_USERS = [
  {
    id: "1",
    name: "Admin Dealer",
    email: "admin@pgic.fr",
    // bcrypt hash de "Admin@2026!"
    passwordHash: "$2b$12$snyGUj7cgsAGMKeh.nH0yucofZOoaUKh41TJElpq1TL5OLxat5aEq",
    role: "directeur" as Role,
  },
  {
    id: "2",
    name: "Émilie Blanc",
    email: "emilie@pgic.fr",
    passwordHash: "$2b$12$snyGUj7cgsAGMKeh.nH0yucofZOoaUKh41TJElpq1TL5OLxat5aEq",
    role: "vendeur" as Role,
  },
  {
    id: "3",
    name: "Marc Lefebvre",
    email: "marc@pgic.fr",
    passwordHash: "$2b$12$snyGUj7cgsAGMKeh.nH0yucofZOoaUKh41TJElpq1TL5OLxat5aEq",
    role: "technicien" as Role,
  },
  {
    id: "4",
    name: "Claire Simon",
    email: "claire@pgic.fr",
    passwordHash: "$2b$12$snyGUj7cgsAGMKeh.nH0yucofZOoaUKh41TJElpq1TL5OLxat5aEq",
    role: "receptionniste" as Role,
  },
];

// Mots de passe démo : Admin@2026! pour tous les comptes — à changer en production

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

        // Vérification du rate limit avant tout traitement
        const rateCheck = checkRateLimit(identifier);
        if (!rateCheck.allowed) {
          const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
          throw new Error(`RATE_LIMIT:${minutes}`);
        }

        const user = DEMO_USERS.find((u) => u.email === identifier);
        if (!user) {
          // On enregistre l'échec même si l'email n'existe pas
          // (évite l'énumération d'utilisateurs par timing différentiel)
          await bcrypt.compare(parsed.data.password, "$2a$12$invalidhashfortimingnormalization");
          recordFailedAttempt(identifier);
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          recordFailedAttempt(identifier);
          return null;
        }

        // Connexion réussie → réinitialiser le compteur
        resetAttempts(identifier);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as Role;
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
    maxAge: 8 * 60 * 60,     // expiration absolue : 8h
    updateAge: 5 * 60,        // renouvellement du token toutes les 5 min d'activité
  },
  secret: process.env.NEXTAUTH_SECRET,
};
