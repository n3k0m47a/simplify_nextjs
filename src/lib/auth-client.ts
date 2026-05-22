import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const authBaseUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_AUTH_URL;

export const authClient = createAuthClient({
  ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),
  plugins: [adminClient()],
});
