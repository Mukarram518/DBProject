import { createFileRoute } from "@tanstack/react-router";
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
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | E-Commerce Management System" },
      {
        name: "description",
        content: "Store profile, currency, and notification preferences for the admin panel.",
      },
      { property: "og:title", content: "Settings | E-Commerce Management System" },
      { property: "og:description", content: "Store profile, currency and notifications." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [storeName, setStoreName] = useState("Nova Retail");
  const [email, setEmail] = useState("admin@shop.com");
  const [currency, setCurrency] = useState("USD");
  const [lowStock, setLowStock] = useState("20");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);

  return (
    <>
      <PageHeader title="Settings" description="Panel preferences for this demo environment." />

      <div className="mx-auto max-w-2xl space-y-4">
        <section className="card-surface p-6">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Store Profile</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={storeName}
                maxLength={60}
                onChange={(event) => setStoreName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="PKR">PKR — Pakistani Rupee</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — Pound Sterling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="low-stock">Low Stock Threshold</Label>
              <Input
                id="low-stock"
                type="number"
                min="0"
                value={lowStock}
                onChange={(event) => setLowStock(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card-surface p-6">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Notifications</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Email alerts</p>
                <p className="text-xs text-muted-foreground">
                  Daily summary of sales and new signups.
                </p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">New order alerts</p>
                <p className="text-xs text-muted-foreground">
                  Notify me whenever an order is placed.
                </p>
              </div>
              <Switch checked={orderAlerts} onCheckedChange={setOrderAlerts} />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Settings saved for this session")}>
            Save Settings
          </Button>
        </div>
      </div>
    </>
  );
}
