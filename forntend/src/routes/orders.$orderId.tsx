import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  currencyPrecise,
  formatDate,
  orderTotal,
  paymentForOrder,
  productName,
} from "@/data/selectors";
import { useStore } from "@/data/store";
import type { OrderStatus } from "@/data/types";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details | E-Commerce Management System" },
      {
        name: "description",
        content: "Full order breakdown: customer, line items, payment method and totals.",
      },
      { property: "og:title", content: "Order Details | E-Commerce Management System" },
      { property: "og:description", content: "Customer, line items, payment and totals." },
    ],
  }),
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { orderId } = Route.useParams();
  const { orders, users, products, payments, updateOrderStatus } = useStore();
  const order = orders.find((o) => o.id === Number(orderId));

  if (!order) {
    return (
      <>
        <PageHeader title="Order not found" backTo="/orders" backLabel="Back to Orders" />
        <div className="card-surface p-10 text-center text-muted-foreground">
          This order no longer exists.
        </div>
      </>
    );
  }

  const customer = users.find((u) => u.id === order.userId);
  const payment = paymentForOrder(payments, order.id);
  const total = orderTotal(order);

  return (
    <>
      <PageHeader
        title={`Order #${order.id}`}
        description={`Placed on ${formatDate(order.date)}`}
        backTo="/orders"
        backLabel="Back to Orders"
        action={
          <div className="flex items-center gap-2">
            <StatusBadge value={order.status} />
            <Select
              value={order.status}
              onValueChange={(value) => {
                updateOrderStatus(order.id, value as OrderStatus);
                toast.success(`Order #${order.id} marked ${value}`);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="card-surface space-y-6 p-6">
        <section>
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Customer
          </h3>
          <p className="mt-2 font-medium">{customer?.name ?? "Unknown customer"}</p>
          <p className="text-sm text-muted-foreground">{customer?.email}</p>
          <p className="text-sm text-muted-foreground">{customer?.phone}</p>
        </section>

        <Separator />

        <section>
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Order Items
          </h3>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="font-medium">{productName(products, item.productId)}</span>
                <span className="flex items-center gap-8">
                  <span className="text-muted-foreground">Qty {item.quantity}</span>
                  <span className="text-muted-foreground">
                    {currencyPrecise(item.unitPrice)} each
                  </span>
                  <span className="w-24 text-right font-medium">
                    {currencyPrecise(item.quantity * item.unitPrice)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        <section className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{currencyPrecise(total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">{order.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment Status</span>
            <StatusBadge value={payment?.status ?? "Pending"} />
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-sm font-semibold tracking-widest uppercase">
            Total
          </span>
          <span className="font-display text-2xl font-semibold">{currencyPrecise(total)}</span>
        </div>
      </div>
    </>
  );
}
