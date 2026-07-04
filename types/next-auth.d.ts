import NextAuth from "next-auth";

export type Role = "directeur" | "vendeur" | "technicien" | "receptionniste";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      company?: Record<string, string>;
      setupComplete?: boolean;
    };
  }
  interface User {
    role: Role;
    company?: Record<string, unknown>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
    company?: Record<string, unknown> | null;
    setupComplete?: boolean;
  }
}
