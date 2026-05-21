import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PogoNav } from "./_nav";

export default async function PogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/pogo/my-avatars");
  }

  return (
    <>
      <PogoNav />
      <main className="pt-16">{children}</main>
    </>
  );
}
