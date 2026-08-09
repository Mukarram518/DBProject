# Permanent Guide for AI Agents (agent.md)

This file serves as a permanent reference guide for future AI agents working on this project. Every AI agent MUST inspect and follow these guidelines prior to making modifications.

---

## 1. Project Purpose & Overview

This repository contains a fullstack e-commerce management system connecting a **Lovable Vite + React Frontend** (`frontend/`) to a production-ready **Node.js + Express + MySQL Backend** (`backend/`) connected to a live **Railway MySQL Database**.

The goal is to maintain full visual and UX fidelity of the frontend UI while powering all CRUD operations, dashboards, analytics, and authentication with real-time MySQL database queries.

---

## 2. Technology Stack

- **Frontend**: Vite, React 19, `@tanstack/react-router`, TailwindCSS v4, Radix UI, Lucide Icons, Sonner, Recharts.
- **Backend**: Node.js, Express, TypeScript (CommonJS/NodeNext), `mysql2/promise`, `bcryptjs`, `jsonwebtoken`, `zod`, `cors`, `dotenv`.
- **Database**: Railway MySQL (`altaria.proxy.rlwy.net:48128/railway`).

---

## 3. Database Schema Reference

The database uses standard relational tables in Railway MySQL:

- **`users`**: `user_id` (PK), `first_name`, `last_name`, `email` (UK), `password`, `phone` (UK), `address`, `role` (`Customer`, `Admin`), `status` (`Active`, `Inactive`), `created_at`.
- **`categories`**: `category_id` (PK), `category_name` (UK), `description`.
- **`products`**: `product_id` (PK), `category_id` (FK), `product_name`, `price`, `stock_quantity`, `description`.
- **`orders`**: `order_id` (PK), `user_id` (FK), `order_date`, `total_amount`, `order_status` (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **`order_items`**: `order_item_id` (PK), `order_id` (FK), `product_id` (FK), `quantity`, `price`.
- **`payments`**: `payment_id` (PK), `order_id` (FK), `payment_date`, `amount`, `payment_method` (`Cash`, `Credit Card`, `Debit Card`, `PayPal`, `Bank Transfer`), `payment_status` (`Pending`, `Completed`, `Failed`).
- **`reviews`**: `review_id` (PK), `user_id` (FK), `product_id` (FK), `rating`, `comment`, `review_date`.

---

## 4. API & Coding Conventions

- **REST API Pattern**: Standard JSON APIs under `/api/`:
  - `GET /api/<entity>` (list/filter)
  - `GET /api/<entity>/:id` (single item)
  - `POST /api/<entity>` (create)
  - `PUT /api/<entity>/:id` (update)
  - `DELETE /api/<entity>/:id` (delete)
- **JSON Response Format**: Consistent structure:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Database Query Parameterization**: ALWAYS use parameter placeholders (`?`) with `pool.query(sql, params)`. NEVER concatenate strings into SQL queries.
- **DTO Mapping**: Controllers MUST translate snake_case DB columns (`user_id`, `product_name`, `stock_quantity`) to camelCase frontend object keys (`id`, `name`, `stock`).

---

## 5. Security & Authentication Rules

- **Password Hashing**: NEVER store plain text passwords. Always hash passwords with `bcrypt.hash(password, 10)`.
- **Secret Credentials**: NEVER hardcode database passwords, connection URLs, or JWT secrets in source code files. Use `.env`.
- **Authorization**: Enforce role checks in backend controllers/middleware. Do not rely solely on hiding frontend buttons.

---

## 6. Database Modification Rules

> [!CAUTION]
> **CRITICAL DATABASE SAFETY RULES**:
> 1. NEVER execute `DROP TABLE` or `DROP DATABASE`.
> 2. NEVER delete pre-existing user or order data unnecessarily.
> 3. NEVER recreate the database tables from scratch when making a change.
> 4. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` or check `INFORMATION_SCHEMA.COLUMNS` prior to adding new columns.

---

## 7. Rules for Frontend Changes

- Do NOT rebuild the frontend UI from scratch.
- Keep existing routes, layouts, Tailwind styles, and user experience intact.
- Update data flow in `frontend/src/data/store.tsx` or `frontend/src/lib/api.ts` to keep the UI synchronized with the backend.

---

## 8. What an AI Agent Must NEVER Do

1. **NEVER** commit real secrets (`DATABASE_URL`, `JWT_SECRET`) to Git repository history.
2. **NEVER** use unparameterized SQL queries that risk SQL injection.
3. **NEVER** break the existing UI layout or component structure.
4. **NEVER** claim a task is complete without compiling code (`npm run build`) and verifying endpoint execution against the real database.

---

## 9. How to Inspect Code Before Making Changes

Before making modifications:
1. Inspect `architecture.md` for system overview and ERD.
2. Inspect the existing backend routes in `backend/src/routes/` and `backend/src/controllers/`.
3. Inspect `frontend/src/data/store.tsx` to understand the state wrapper.
4. Test Railway MySQL connectivity before writing database logic.
