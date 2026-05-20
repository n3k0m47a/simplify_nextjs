import type { Config } from "drizzle-kit";

export default {
  schema: "./src/auth-schema.ts",
  out: "drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
