import type { Order, Payment, Product, Review, User } from "./types";

export const currency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const currencyPrecise = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const padId = (id: number, size = 2) => String(id).padStart(size, "0");

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y!.slice(2)}`;
};

export const orderTotal = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Sales grouped by the last 12 calendar months, oldest first. */
export function monthlySales(orders: Order[]) {
  const buckets = new Map<string, number>();
  const end = new Date(Date.UTC(2026, 7, 1));
  const keys: Array<{ key: string; label: string }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    keys.push({ key, label: MONTH_LABELS[d.getUTCMonth()]! });
    buckets.set(key, 0);
  }
  for (const order of orders) {
    if (order.status === "Cancelled") continue;
    const key = order.date.slice(0, 7);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + orderTotal(order));
  }
  return keys.map(({ key, label }) => ({
    month: label,
    sales: Math.round(buckets.get(key) ?? 0),
  }));
}

export function totalSales(orders: Order[]) {
  return orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + orderTotal(o), 0);
}

export function topSellingProducts(orders: Order[], products: Product[], limit = 5) {
  const sold = new Map<number, number>();
  for (const order of orders) {
    if (order.status === "Cancelled") continue;
    for (const item of order.items) {
      sold.set(item.productId, (sold.get(item.productId) ?? 0) + item.quantity);
    }
  }
  return [...sold.entries()]
    .map(([productId, quantity]) => ({
      product: products.find((p) => p.id === productId),
      quantity,
    }))
    .filter((row): row is { product: Product; quantity: number } => Boolean(row.product))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export const userName = (users: User[], id: number) =>
  users.find((u) => u.id === id)?.name ?? "Unknown";

export const productName = (products: Product[], id: number) =>
  products.find((p) => p.id === id)?.name ?? "Unknown product";

export const paymentForOrder = (payments: Payment[], orderId: number) =>
  payments.find((p) => p.orderId === orderId);

export const averageRating = (reviews: Review[], productId: number) => {
  const rows = reviews.filter((r) => r.productId === productId);
  if (!rows.length) return 0;
  return rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
};
