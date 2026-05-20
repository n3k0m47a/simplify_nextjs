import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL is optional if your API is on the same domain
  // baseURL: "http://localhost:3000",
});
