import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { useStore } from "@/data/store";
import {
  currency,
  formatDate,
  monthlySales,
  orderTotal,
  topSellingProducts,
  totalSales,
  userName,
} from "@/data/selectors";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | E-Commerce Management System" },
      {
        name: "description",
        content:
          "Live overview of users, products, orders and sales performance across the store.",
      },
      { property: "og:title", content: "Dashboard | E-Commerce Management System" },
      {
        property: "og:description",
        content: "Live overview of users, products, orders and sales performance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { users, products, orders, categories } = useStore();

  const sales = totalSales(orders);
  const chartData = monthlySales(orders);
  const recent = orders.slice(0, 6);
  const top = topSellingProducts(orders, products, 5);
  const maxSold = top[0]?.quantity ?? 1;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Overview across ${categories.length} categories and ${orders.length} orders.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={String(users.length)} icon={Users} hint="Registered accounts" />
        <StatCard label="Products" value={String(products.length)} icon={Package} hint="Across all categories" />
        <StatCard label="Orders" value={String(orders.length)} icon={ShoppingCart} hint="All time" />
        <StatCard label="Total Sales" value={currency(sales)} icon={DollarSign} hint="Excluding cancelled" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="card-surface lg:col-span-2">
          <header className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase">Monthly Sales</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Last 12 months</p>
          </header>
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [currency(Number(value)), "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase">Recent Orders</h3>
            <Link to="/orders" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  to="/orders/$orderId"
                  params={{ orderId: String(order.id) }}
                  className="flex items-center justify-between gap-2 px-5 py-3 transition-colors hover:bg-muted"
                >
                  <span>
                    <span className="block text-sm font-medium">#{order.id}</span>
                    <span className="block text-xs text-muted-foreground">
                      {userName(users, order.userId)} · {formatDate(order.date)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold">{currency(orderTotal(order))}</span>
                    <StatusBadge value={order.status} className="mt-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card-surface mt-4">
        <header className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Top Selling Products</h3>
        </header>
        <ul className="divide-y divide-border">
          {top.map(({ product, quantity }) => (
            <li key={product.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">{quantity} sold</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(6, (quantity / maxSold) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
