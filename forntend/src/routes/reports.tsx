import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currency,
  currencyPrecise,
  monthlySales,
  topSellingProducts,
  totalSales,
} from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics | E-Commerce Management System" },
      {
        name: "description",
        content: "Sales analytics: best sellers, monthly revenue trend and order value summary.",
      },
      { property: "og:title", content: "Reports & Analytics | E-Commerce Management System" },
      { property: "og:description", content: "Best sellers, revenue trend and order summary." },
    ],
  }),
  component: ReportsPage,
});

const RANGES: Record<string, { label: string; days: number | null }> = {
  "30": { label: "Last 30 days", days: 30 },
  "90": { label: "Last 90 days", days: 90 },
  "365": { label: "Last 12 months", days: 365 },
  all: { label: "All time", days: null },
};

function ReportsPage() {
  const { orders, products } = useStore();
  const [range, setRange] = useState("365");

  const scoped = useMemo(() => {
    const days = RANGES[range]?.days ?? null;
    if (!days) return orders;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    return orders.filter((o) => o.date >= cutoff);
  }, [orders, range]);

  const sales = totalSales(scoped);
  const active = scoped.filter((o) => o.status !== "Cancelled");
  const avgOrder = active.length ? sales / active.length : 0;
  const top = topSellingProducts(scoped, products, 6);
  const maxSold = top[0]?.quantity ?? 1;
  const chartData = monthlySales(scoped);

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Sales performance and best-selling products."
        action={
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RANGES).map(([value, option]) => (
                <SelectItem key={value} value={value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card-surface lg:col-span-2">
          <header className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase">Top Selling Products</h3>
          </header>
          <ul className="divide-y divide-border">
            {top.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-muted-foreground">No product sales found in database for selected period.</li>
            ) : (
              top.map(({ product, quantity }) => (
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
              ))
            )}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="card-surface p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue ({RANGES[range]?.label})
            </h4>
            <p className="font-display mt-2 text-3xl font-bold tracking-tight">{currency(sales)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {active.length} active orders
            </p>
          </section>

          <section className="card-surface p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Order Value
            </h4>
            <p className="font-display mt-2 text-3xl font-bold tracking-tight">
              {currencyPrecise(avgOrder)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Per order average</p>
          </section>
        </div>
      </div>

      <section className="card-surface mt-4">
        <header className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Monthly Revenue Trend</h3>
        </header>
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="reportsSalesFill" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#reportsSalesFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
