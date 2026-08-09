import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const TITLES: Array<{ match: RegExp; title: string }> = [
  { match: /^\/$/, title: "Dashboard" },
  { match: /^\/users\/new/, title: "Add New User" },
  { match: /^\/users\/\d+\/edit/, title: "Edit User" },
  { match: /^\/users/, title: "Users" },
  { match: /^\/products\/new/, title: "Add Product" },
  { match: /^\/products\/\d+\/edit/, title: "Edit Product" },
  { match: /^\/products/, title: "Products" },
  { match: /^\/categories\/new/, title: "Add Category" },
  { match: /^\/categories\/\d+\/edit/, title: "Edit Category" },
  { match: /^\/categories/, title: "Categories" },
  { match: /^\/orders\/new/, title: "Add New Order" },
  { match: /^\/orders\/\d+/, title: "Order Details" },
  { match: /^\/orders/, title: "Orders" },
  { match: /^\/payments/, title: "Payments" },
  { match: /^\/reviews/, title: "Reviews" },
  { match: /^\/reports/, title: "Reports & Analytics" },
  { match: /^\/settings/, title: "Settings" },
];

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = TITLES.find((t) => t.match.test(pathname))?.title ?? "E-Commerce Management";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="font-display text-base font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm transition-colors hover:bg-muted">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              A
            </span>
            <span className="hidden sm:inline">Admin</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <span className="block text-sm font-medium">Admin</span>
              <span className="block text-xs font-normal text-muted-foreground">
                admin@shop.com
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <UserIcon className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
