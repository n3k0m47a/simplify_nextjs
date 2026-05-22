import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getSession();
  const { callbackUrl } = await searchParams;

  if (session) {
    const target =
      callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/dashboard";
    redirect(target);
  }

  return <LoginForm callbackUrl={callbackUrl} />;
}
