import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { padId } from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/users/")({
  head: () => ({
    meta: [
      { title: "Users | E-Commerce Management System" },
      {
        name: "description",
        content: "Browse, search and manage customer and staff accounts with roles and status.",
      },
      { property: "og:title", content: "Users | E-Commerce Management System" },
      { property: "og:description", content: "Manage customer and staff accounts." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { users, deleteUser, loading } = useStore();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      const matchesRole = role === "all" || user.role === role;
      const matchesStatus = status === "all" || user.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const effectivePageSize = pageSize === -1 ? (filtered.length || 1) : pageSize;
  const pageCount = Math.ceil(filtered.length / effectivePageSize);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const rows = filtered.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize);

  const reset = (fn: (value: string) => void) => (value: string) => {
    fn(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Users"
        description={`${users.length} accounts loaded directly from Railway database.`}
        action={
          <Button asChild>
            <Link to="/users/new">
              <Plus className="size-4" />
              Add User
            </Link>
          </Button>
        }
      />

      <div className="card-surface overflow-hidden">
        <TableToolbar
          search={search}
          onSearch={reset(setSearch)}
          placeholder="Search name or email..."
        >
          <Select value={role} onValueChange={reset(setRole)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="User">User / Customer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={reset(setStatus)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
              <SelectItem value="-1">Show All ({filtered.length})</SelectItem>
            </SelectContent>
          </Select>
        </TableToolbar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {padId(user.id)}
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.phone || "-"}</TableCell>
                <TableCell>
                  <StatusBadge value={user.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={user.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/users/$userId/edit" params={{ userId: String(user.id) }}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteUser(user.id);
                        toast.success(`Deleted ${user.name}`);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {loading ? "Loading users from Railway MySQL database..." : "No users match your filters."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={effectivePageSize}
          onPage={setPage}
        />
      </div>
    </>
  );
}
