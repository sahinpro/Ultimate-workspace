import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isPublic =
        path === "/" ||
        path === "/login" ||
        path === "/register" ||
        path.startsWith("/api/auth");
      if (isPublic) return true;
      return isLoggedIn;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub ?? (token.id as string);
        session.user.role = (token.role as string) ?? "USER";
        session.user.onboardingComplete = (token.onboardingComplete as boolean) ?? false;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
