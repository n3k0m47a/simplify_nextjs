import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/auth-schema";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL ?? process.env.NEXTAUTH_URL;
const baseURL = authUrl?.replace(/\/$/, "") ? `${authUrl.replace(/\/$/, "")}/api/auth` : undefined;
const useSecureCookies = process.env.AUTH_USE_SECURE_COOKIES
  ? process.env.AUTH_USE_SECURE_COOKIES === "true"
  : authUrl?.startsWith("https://") ?? process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies,
  },
  plugins: [admin()],
});
