"use client";

import * as React from "react";
import { MoreHorizontal, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { UserCreateDialog } from "@/components/forms/UserCreateDialog";
import { usersApi } from "@/api/users";
import { User, UserStatus } from "@/types/user";

export function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Search Filter
  const filteredUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toString().includes(q) ||
        u.role.name.toLowerCase().includes(q) ||
        (u.branch?.name.toLowerCase().includes(q) ?? false)
    );
  }, [query, users]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  // Status Update
  const toggleStatus = async (user: User) => {
    try {
      const newStatus: UserStatus =
        user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await usersApi.updateStatus(user.id, {
        status: newStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );

      toast.success("User status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const getStatusVariant = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "PENDING":
        return "secondary";
      case "SUSPENDED":
      case "LOCKED":
        return "destructive";
      case "INACTIVE":
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage users, roles, and account status."
        actionLabel="Add user"
        onAction={() => setCreateOpen(true)}
      />

      <Card className="border-border/70">
        <CardContent className="pt-6">
          {/* Top Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-9"
              />
            </div>

            {selectedCount > 0 && (
              <Button variant="secondary">
                Selected: {selectedCount}
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="mt-5 overflow-hidden rounded-md border">  
            <Table className="table-fixed w-full">
              <TableHeader className="bg-[hsl(var(--table-head))]">
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        filteredUsers.length > 0 &&
                        filteredUsers.every((u) => selected[u.id])
                      }
                      onCheckedChange={(v) => {
                        const checked = Boolean(v);
                        const next: Record<number, boolean> = {};
                        filteredUsers.forEach(
                          (u) => (next[u.id] = checked)
                        );
                        setSelected(next);
                      }}
                    />
                  </TableHead>

                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[150px]">Username</TableHead>
                  <TableHead className="w-[220px]">Email</TableHead>
                  <TableHead className="w-[150px]">Role</TableHead>
                  <TableHead className="w-[150px]">Branch</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={Boolean(selected[user.id])}
                        onCheckedChange={(v) =>
                          setSelected((prev) => ({
                            ...prev,
                            [user.id]: Boolean(v),
                          }))
                        }
                      />
                    </TableCell>

                    <TableCell className="font-mono text-sm">
                      {user.id}
                    </TableCell>

                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {user.role.name}
                      </Badge>
                    </TableCell>

                    <TableCell className="truncate">
                      {user.branch ? user.branch.name : "-"}
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toggleStatus(user)}
                          >
                            Toggle Active
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {loading && (
            <div className="mt-4 text-sm text-muted-foreground">
              Loading users...
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>

      <UserCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
