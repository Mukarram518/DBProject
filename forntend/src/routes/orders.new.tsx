import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { currencyPrecise, productName } from "@/data/selectors";
import { useStore } from "@/data/store";
import type { OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from "@/data/types";

export const Route = createFileRoute("/orders/new")({
  head: () => ({
    meta: [
      { title: "Add New Order | E-Commerce Management System" },
      {
        name: "description",
        content: "Create an order: pick a customer, add product line items and set payment status.",
      },
      { property: "og:title", content: "Add New Order | E-Commerce Management System" },
      { property: "og:description", content: "Create an order with line items and payment." },
    ],
  }),
  component: AddOrderPage,
});

const METHODS: PaymentMethod[] = [
  "Credit Card",
  "Debit Card",
  "Cash on Delivery",
  "Bank Transfer",
  "EasyPaisa",
];

function AddOrderPage() {
  const { users, products, addOrder } = useStore();
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("2026-08-09");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("Credit Card");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");
  const [status, setStatus] = useState<OrderStatus>("Pending");

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const addItem = () => {
    const product = products.find((p) => p.id === Number(productId));
    const qty = Number(quantity);
    if (!product) {
      toast.error("Select a product first");
      return;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      toast.error("Quantity must be between 1 and 999");
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { productId: product.id, quantity: qty, unitPrice: product.price }];
    });
    setProductId("");
    setQuantity("1");
  };

  const submit = () => {
    if (!customerId) {
      toast.error("Select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    const order = addOrder(
      { userId: Number(customerId), date, status, paymentMethod: method, items },
      paymentStatus,
    );
    toast.success(`Order #${order.id} created`);
    navigate({ to: "/orders/$orderId", params: { orderId: String(order.id) } });
  };

  return (
    <>
      <PageHeader
        title="Add New Order"
        description="Build an order from the catalog."
        backTo="/orders"
        backLabel="Back to Orders"
      />

      <div className="card-surface space-y-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {users.slice(0, 60).map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name} — {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-date">Order Date</Label>
            <Input
              id="order-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Add Products</Label>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-56 flex-1">
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.slice(0, 80).map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name} — {currencyPrecise(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              min="1"
              className="w-24"
              placeholder="Qty"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase">Order Items</h3>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No items added yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="font-medium">{productName(products, item.productId)}</span>
                  <span className="flex items-center gap-6">
                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    <span className="font-medium">
                      {currencyPrecise(item.quantity * item.unitPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setItems((prev) => prev.filter((i) => i.productId !== item.productId))
                      }
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{currencyPrecise(subtotal)}</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Order Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger className="w-full">
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
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-sm font-semibold tracking-wide uppercase">Total</span>
          <span className="font-display text-2xl font-semibold">{currencyPrecise(subtotal)}</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/orders" })}>
            Cancel
          </Button>
          <Button onClick={submit}>Create Order</Button>
        </div>
      </div>
    </>
  );
}
