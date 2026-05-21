import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { UsersTable } from "@/components/users/users-table";

export const metadata: Metadata = { title: "Benutzerverwaltung" };

const PAGE_SIZE = 20;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: PAGE_SIZE,
      offset,
      ...(search
        ? { searchValue: search, searchField: "email", searchOperator: "contains" }
        : {}),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Benutzerverwaltung</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {result.total} {result.total === 1 ? "Benutzer" : "Benutzer"} gesamt
        </p>
      </div>
      <UsersTable
        users={result.users}
        total={result.total}
        page={page}
        pageSize={PAGE_SIZE}
        search={search ?? ""}
      />
    </div>
  );
}
