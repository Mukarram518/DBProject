import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

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
import { currency, formatDate, orderTotal, userName } from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Orders | E-Commerce Management System" },
      {
        name: "description",
        content: "Track every order with customer, date, total and fulfilment status.",
      },
      { property: "og:title", content: "Orders | E-Commerce Management System" },
      { property: "og:description", content: "Track orders by customer, date and status." },
    ],
  }),
  component: OrdersPage,
});

const PAGE_SIZE = 12;

function OrdersPage() {
  const { orders, users } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const [customer, setCustomer] = useState("all");
  const [page, setPage] = useState(1);

  const customerOptions = useMemo(() => {
    const ids = new Set(orders.map((o) => o.userId));
    return users
      .filter((u) => ids.has(u.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 60);
  }, [orders, users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase().replace("#", "");
    const cutoff = { "30": 30, "90": 90, "365": 365 }[range];
    const cutoffDate = cutoff
      ? new Date(Date.UTC(2026, 7, 9) - cutoff * 86400000).toISOString().slice(0, 10)
      : null;

    return orders.filter((order) => {
      const name = userName(users, order.userId).toLowerCase();
      const matchesQuery = !q || String(order.id).includes(q) || name.includes(q);
      const matchesStatus = status === "all" || order.status === status;
      const matchesCustomer = customer === "all" || order.userId === Number(customer);
      const matchesDate = !cutoffDate || order.date >= cutoffDate;
      return matchesQuery && matchesStatus && matchesCustomer && matchesDate;
    });
  }, [orders, users, search, status, customer, range]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const reset = (fn: (value: string) => void) => (value: string) => {
    fn(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${orders.length} orders placed to date.`}
        action={
          <Button asChild>
            <Link to="/orders/new">
              <Plus className="size-4" />
              Add Order
            </Link>
          </Button>
        }
      />

      <div className="card-surface overflow-hidden">
        <TableToolbar
          search={search}
          onSearch={reset(setSearch)}
          placeholder="Search order # or customer..."
        >
          <Select value={status} onValueChange={reset(setStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={reset(setRange)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={customer} onValueChange={reset(setCustomer)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customerOptions.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableToolbar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{userName(users, order.userId)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.date)}</TableCell>
                <TableCell className="text-right font-medium">
                  {currency(orderTotal(order))}
                </TableCell>
                <TableCell>
                  <StatusBadge value={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/orders/$orderId" params={{ orderId: String(order.id) }}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No orders match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      </div>
    </>
  );
}
