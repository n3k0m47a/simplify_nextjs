import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL ?? process.env.NEXTAUTH_URL;
const baseURL = authUrl?.replace(/\/$/, "") ? `${authUrl.replace(/\/$/, "")}/api/auth` : undefined;

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
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});

