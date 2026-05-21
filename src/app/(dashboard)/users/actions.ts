"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function listUsers(params: {
  limit?: number;
  offset?: number;
  searchValue?: string;
  searchField?: "email" | "name";
}) {
  await requireAdmin();
  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      searchValue: params.searchValue,
      searchField: params.searchField ?? "email",
      searchOperator: "contains",
    },
  });
  return result;
}

export async function updateUser(
  userId: string,
  data: { name?: string; email?: string; role?: string }
) {
  await requireAdmin();
  await auth.api.adminUpdateUser({
    headers: await headers(),
    body: { userId, data },
  });
  revalidatePath("/users");
}

export async function banUser(userId: string, banReason?: string) {
  await requireAdmin();
  await auth.api.banUser({
    headers: await headers(),
    body: { userId, banReason },
  });
  revalidatePath("/users");
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  await auth.api.unbanUser({
    headers: await headers(),
    body: { userId },
  });
  revalidatePath("/users");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  await auth.api.removeUser({
    headers: await headers(),
    body: { userId },
  });
  revalidatePath("/users");
}
