import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableToolbar } from "@/components/admin/table-toolbar";
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
import { currencyPrecise, formatDate, padId, userName } from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments | E-Commerce Management System" },
      {
        name: "description",
        content: "Payment records linked to orders with amounts, methods and settlement status.",
      },
      { property: "og:title", content: "Payments | E-Commerce Management System" },
      { property: "og:description", content: "Payment records with amounts and status." },
    ],
  }),
  component: PaymentsPage,
});

const PAGE_SIZE = 12;

function PaymentsPage() {
  const { payments, orders, users } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase().replace("#", "");
    return payments
      .map((payment) => {
        const order = orders.find((o) => o.id === payment.orderId);
        return {
          ...payment,
          customer: order ? userName(users, order.userId) : "Unknown",
        };
      })
      .filter((payment) => {
        const matchesQuery =
          !q ||
          String(payment.orderId).includes(q) ||
          payment.customer.toLowerCase().includes(q) ||
          `p${padId(payment.id, 3)}`.includes(q);
        const matchesStatus = status === "all" || payment.status === status;
        return matchesQuery && matchesStatus;
      });
  }, [payments, orders, users, search, status]);

  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalCollected = rows
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        description={`${currencyPrecise(totalCollected)} collected across ${rows.length} records.`}
      />

      <div className="card-surface overflow-hidden">
        <TableToolbar
          search={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search order / customer..."
        >
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </TableToolbar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  P{padId(payment.id, 3)}
                </TableCell>
                <TableCell>
                  <Link
                    to="/orders/$orderId"
                    params={{ orderId: String(payment.orderId) }}
                    className="font-medium text-accent hover:underline"
                  >
                    #{payment.orderId}
                  </Link>
                </TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                <TableCell className="text-right font-medium">
                  {currencyPrecise(payment.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge value={payment.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(payment.date)}</TableCell>
              </TableRow>
            ))}
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No payments match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          total={rows.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      </div>
    </>
  );
}
