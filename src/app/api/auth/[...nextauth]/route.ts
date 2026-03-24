import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "@/src/lib/apiClient"; 

interface LoginResponse {
  access_token: string;
  user: {
    id: string | number;
    name: string;
    email: string;
  };
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: {
          label: "Correo",
          type: "email",
          placeholder: "nico@test.com",
        },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          const data = await apiClient<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (data && data.access_token) {
            return {
              id: data.user.id.toString(),
              name: data.user.name,
              email: data.user.email,
              accessToken: data.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("Error en NextAuth authorize:", error);
          return null; 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret-key",
});

export { handler as GET, handler as POST };
