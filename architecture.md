# System Architecture Documentation

This document describes the complete system architecture for the E-Commerce Management System, connecting the **Lovable Vite + React Frontend** to a production-ready **Node.js + Express Backend** powered by a **Railway MySQL Database**.

---

## 1. High-Level Architecture Overview

```mermaid
graph TD
    Client["Lovable Frontend (Vite + React + TanStack Router)"]
    API["Backend API (Node.js + Express + TypeScript)"]
    DB[(Railway MySQL Database)]

    Client -->|REST HTTP Requests / JSON| API
    API -->|Parameterized SQL Queries (mysql2)| DB
    API -->|Authentication / JWT Verification| Client
```

---

## 2. Architecture Layers

### A. Frontend Layer (`frontend/`)
- **Framework**: Vite + React 19 + TypeScript
- **Routing**: `@tanstack/react-router`
- **State Management**: React Context (`AdminStoreProvider` in `src/data/store.tsx`)
- **API Client**: Modular fetch wrapper in `src/lib/api.ts` with token handling and error state propagation.
- **UI Components**: Radix UI primitives + TailwindCSS v4 + Lucide Icons + Sonner Toasts + Recharts analytics.

### B. Backend Layer (`backend/`)
- **Runtime & Framework**: Node.js + Express + TypeScript (ES2022)
- **Database Driver**: `mysql2/promise` with connection pooling (`pool.query`)
- **Validation**: Zod schema validation
- **Auth & Security**: JWT (`jsonwebtoken`) tokens + `bcryptjs` password hashing + CORS configuration.
- **Middleware**: Centralized error handler (`errorHandler.ts`), JWT Bearer token authentication (`auth.ts`), and role authorization.

### C. Database Layer (Railway MySQL)
- **Host**: `altaria.proxy.rlwy.net:48128`
- **Database**: `railway`
- **Tables**: `users`, `categories`, `products`, `orders`, `order_items`, `payments`, `reviews`.
- **Relationships**:
  - `categories` (1) ──< `products` (N)
  - `users` (1) ──< `orders` (N)
  - `orders` (1) ──< `order_items` (N)
  - `products` (1) ──< `order_items` (N)
  - `orders` (1) ── (1) `payments`
  - `users` (1) ──< `reviews` (N)
  - `products` (1) ──< `reviews` (N)

---

## 3. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ orders : places
    users ||--o{ reviews : writes
    categories ||--o{ products : contains
    products ||--o{ order_items : ordered_in
    orders ||--o{ order_items : includes
    orders ||--|| payments : has
    products ||--o{ reviews : receives

    users {
        int user_id PK
        string first_name
        string last_name
        string email UK
        string password
        string phone UK
        enum role "Customer, Admin"
        enum status "Active, Inactive"
        timestamp created_at
    }

    categories {
        int category_id PK
        string category_name UK
        text description
    }

    products {
        int product_id PK
        int category_id FK
        string product_name
        decimal price
        int stock_quantity
        text description
    }

    orders {
        int order_id PK
        int user_id FK
        timestamp order_date
        decimal total_amount
        enum order_status "Pending, Processing, Shipped, Delivered, Cancelled"
    }

    order_items {
        int order_item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }

    payments {
        int payment_id PK
        int order_id FK
        timestamp payment_date
        decimal amount
        enum payment_method "Cash, Credit Card, Debit Card, PayPal, Bank Transfer"
        enum payment_status "Pending, Completed, Failed"
    }

    reviews {
        int review_id PK
        int user_id FK
        int product_id FK
        int rating
        text comment
        timestamp review_date
    }
```

---

## 4. REST API Endpoint Mapping

| HTTP Method | Endpoint | Controller Action | Railway Database Table(s) | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | Health Check | System / Database Ping | Verifies server and Railway DB status |
| `POST` | `/api/auth/login` | `login` | `users` | Verifies user credentials & returns JWT token |
| `POST` | `/api/auth/register` | `register` | `users` | Hashes password & creates new user account |
| `GET` | `/api/auth/me` | `getMe` | `users` | Returns profile of currently authenticated user |
| `GET` | `/api/users` | `getUsers` | `users` | List, search & filter all user accounts |
| `GET` | `/api/users/:id` | `getUserById` | `users` | Fetch single user details |
| `POST` | `/api/users` | `createUser` | `users` | Insert new user into Railway DB |
| `PUT` | `/api/users/:id` | `updateUser` | `users` | Update existing user details |
| `DELETE` | `/api/users/:id` | `deleteUser` | `users` | Delete user record |
| `GET` | `/api/categories` | `getCategories` | `categories` | List all product categories |
| `POST` | `/api/categories` | `createCategory` | `categories` | Add category |
| `PUT` | `/api/categories/:id` | `updateCategory` | `categories` | Update category |
| `DELETE` | `/api/categories/:id` | `deleteCategory` | `categories` | Delete category |
| `GET` | `/api/products` | `getProducts` | `products` | List, filter by category/search products |
| `POST` | `/api/products` | `createProduct` | `products` | Add product |
| `PUT` | `/api/products/:id` | `updateProduct` | `products` | Update product price/stock/details |
| `DELETE` | `/api/products/:id` | `deleteProduct` | `products` | Delete product |
| `GET` | `/api/orders` | `getOrders` | `orders`, `order_items`, `payments` | List orders with line items |
| `POST` | `/api/orders` | `createOrder` | `orders`, `order_items`, `payments` | Create order, line items & payment |
| `PATCH` | `/api/orders/:id/status`| `updateOrderStatus`| `orders`, `payments` | Update order and payment status |
| `GET` | `/api/payments` | `getPayments` | `payments` | List all payment records |
| `GET` | `/api/reviews` | `getReviews` | `reviews` | List product reviews |
| `POST` | `/api/reviews` | `createReview` | `reviews` | Submit product review |
| `DELETE` | `/api/reviews/:id` | `deleteReview` | `reviews` | Delete review |
| `GET` | `/api/dashboard/stats` | `getDashboardOverview` | `users`, `products`, `orders`, `payments` | Returns live aggregate store statistics |
| `GET` | `/api/reports/analytics`| `getAnalyticsReport` | All tables | Revenue by category, top customers, low stock |

---

## 5. Folder Structure

```
DBProject/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts           # MySQL connection pool configuration
│   │   │   └── env.ts          # Zod environment variable loader
│   │   ├── controllers/        # REST controller handlers
│   │   ├── middleware/         # Auth & error handling middleware
│   │   ├── routes/             # Express API route declarations
│   │   ├── services/           # DB schema initialization & seed logic
│   │   ├── types/              # TypeScript definitions & DTOs
│   │   └── server.ts           # Express application bootstrap
│   ├── .env                    # Local environment config with DATABASE_URL
│   ├── .env.example            # Environment template
│   ├── package.json            # Node backend dependencies
│   └── tsconfig.json           # TypeScript configuration
├── frontend/
│   ├── src/
│   │   ├── components/         # Admin UI components & forms
│   │   ├── data/
│   │   │   ├── store.tsx       # State management & live API sync
│   │   │   ├── generate.ts     # Fallback seed generator
│   │   │   └── types.ts        # Frontend data model types
│   │   ├── lib/
│   │   │   └── api.ts          # Centralized API fetch wrapper
│   │   └── routes/             # TanStack Router pages
│   ├── package.json            # React frontend dependencies
│   └── vite.config.ts          # Vite build config
├── .env                        # Root environment file
├── .env.example                # Root environment template
├── architecture.md             # System architecture documentation
└── agent.md                    # Permanent AI agent development guide
```

---

## 6. Local Development Setup

1. **Install Dependencies**:
   ```bash
   # Install Backend
   cd backend
   npm install

   # Install Frontend
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in `backend/` or root containing:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=mysql://root:mRtYVZRTLHwdYsjpzbaBhumQgQDKSNEE@altaria.proxy.rlwy.net:48128/railway
   JWT_SECRET=super-secret-jwt-key-shop-shine-realm-2026
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

4. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 7. Security Considerations

- **SQL Injection Prevention**: All database queries use parameterized placeholders (`?`) provided by `mysql2/promise`. Raw concatenated SQL queries are strictly forbidden.
- **Password Hashing**: User passwords are never stored in plain text; they are hashed using `bcryptjs` with a cost factor of 10.
- **JWT Protection**: Private endpoints require Bearer JWT authorization headers validated against `JWT_SECRET`.
- **Credential Safety**: Production secrets and Railway database credentials are kept exclusively in `.env` files and excluded from Git commits via `.gitignore`.
