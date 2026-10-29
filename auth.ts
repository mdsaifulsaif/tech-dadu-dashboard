import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your admin email and password");
        }

        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.message || "Invalid credentials");
          }

          if (result.success && result.data?.user) {
            const user = result.data.user;

            // STRICT ROLE CHECK: Only admin is allowed!
            if (user.role !== "admin") {
              throw new Error("Access Denied: You must have Administrator privileges to enter.");
            }

            return {
              id: user.id || user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.avatar || null,
              accessToken: result.data.accessToken,
            };
          }

          return null;
        } catch (error: any) {
          throw new Error(error.message || "Failed to authenticate as Admin");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "tech_dadu_dashboard_super_secret_auth_key_2026_xyz",
});

