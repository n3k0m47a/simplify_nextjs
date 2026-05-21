"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontalIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { banUser, unbanUser } from "@/app/(dashboard)/users/actions";
import { UserEditDialog } from "@/components/users/user-edit-dialog";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: Date;
};

export function UsersTable({
  users,
  total,
  page,
  pageSize,
  search,
}: {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        const params = new URLSearchParams();
        if (value) params.set("search", value);
        router.replace(`/users?${params.toString()}`);
      }, 300);
      setDebounceTimer(timer);
    },
    [debounceTimer, router]
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    params.set("page", String(newPage));
    router.replace(`/users?${params.toString()}`);
  };

  const handleBan = (user: AdminUser) => {
    startTransition(async () => {
      await banUser(user.id);
      router.refresh();
    });
  };

  const handleUnban = (user: AdminUser) => {
    startTransition(async () => {
      await unbanUser(user.id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Suche nach E-Mail oder Name…"
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Keine Benutzer gefunden.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role === "admin" ? "Admin" : "Benutzer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Gesperrt</Badge>
                    ) : (
                      <Badge variant="secondary">Aktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                        disabled={isPending}
                      >
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">Aktionen</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditUser(user)}>
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.banned ? (
                          <DropdownMenuItem onClick={() => handleUnban(user)}>
                            Entsperren
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleBan(user)}>
                            Sperren
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteUser(user)}
                        >
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {page} von {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}

      {editUser && (
        <UserEditDialog
          user={editUser}
          open={true}
          onClose={() => setEditUser(null)}
        />
      )}

      {deleteUser && (
        <UserDeleteDialog
          user={deleteUser}
          open={true}
          onClose={() => setDeleteUser(null)}
        />
      )}
    </div>
  );
}
