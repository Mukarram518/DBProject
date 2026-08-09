# E-Commerce Management System — Admin Frontend

A complete, professional admin panel matching your wireframes, built as a frontend-only app with realistic demo data (100 users, 200 products, 10 categories, 500 orders, order items, payments, 300 reviews generated in-memory). No login screen — the panel opens straight to the dashboard.

Since you asked me to pick the colors: **Navy Trust** — deep navy `#0f1b3d` sidebar, crisp `#e8edf3` app background, blue `#3b6fa0` primary accent, white cards. Status badges get their own colors (green = Completed/Paid, amber = Processing/Pending, red = Cancelled/Failed). Typography: Space Grotesk headings + DM Sans body. Restrained radius (8px), subtle card shadows, dense readable data tables.

## Layout

Fixed dark navy sidebar (collapsible to icons) with: Dashboard, Users, Products, Categories, Orders, Payments, Reviews, Reports, and Settings pinned at the bottom. Top bar shows the current page title on the left and an "Admin" dropdown on the right.

## Screens

| Screen | Content |
| --- | --- |
| Dashboard | 4 stat cards (Total Users, Products, Orders, Total Sales), Monthly Sales area chart + Recent Orders list side by side, Top Selling Products panel below |
| Users List | Search by name/email, Role and Status filters, table (ID, Name, Email, Phone, Role, Actions), pagination, "+ Add User" |
| Add / Edit User | Centered card form: Full Name, Email, Phone, Password, Role, Status + Cancel/Save. Back link to Users |
| Products List | Search, Category / Stock / Sort filters, table (ID, Product, Category, Price, Stock, Actions), out-of-stock highlighted |
| Add / Edit Product | Full-width form: Name, Category, Price + Stock side by side, Description textarea |
| Categories List | Search, table (ID, Category Name, Products count, Actions) |
| Add / Edit Category | Centered card: Category Name, Description |
| Orders List | Search, Status / Date / Customer filters, table (Order, Customer, Date, Total, Status, View) |
| Add Order | Customer select, Order Date, product + qty line-item builder with Add Item / Remove, live Subtotal, Payment Method, Status, Total |
| Order Details | Customer block, order items, subtotal, payment method + status, total, status badge in header, Back to Orders |
| Payments | Search order/customer, Status filter, table (ID, Order, Customer, Amount, Status, Date) |
| Reviews | Search product, Rating filter, table with star ratings and Delete action |
| Reports | Top Selling Products horizontal bars + Sales Summary (Total Sales, Total Orders, Avg Order) side by side, Monthly Sales chart full width, Date Range selector |

Create/edit/delete actions work against the in-session demo data (tables update live, toast confirmation) and reset on refresh, since there's no database.

## Technical notes

- Routes under `src/routes/`: `index.tsx` (dashboard), `users.index/new/$id.edit`, `products.*`, `categories.*`, `orders.index/new/$orderId`, `payments`, `reviews`, `reports`, `settings`. Each leaf route gets its own `head()` metadata.
- Shared shell (sidebar + top bar) in `src/routes/__root.tsx` using the shadcn sidebar; nav highlights the active route.
- Demo dataset generated deterministically in `src/data/` (seeded, so numbers are stable) and held in a React context provider that exposes CRUD mutators.
- Reusable `DataTable`, `PageHeader`, `StatCard`, `StatusBadge`, and form-field components so all list/form screens stay consistent.
- Charts with Recharts; validation with zod + react-hook-form on all forms.
- Navy/blue palette and fonts added as design tokens in `src/styles.css` (no hardcoded colors in components).
