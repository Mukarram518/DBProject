import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type {
  Category,
  Dataset,
  Order,
  Payment,
  PaymentStatus,
  Product,
  Review,
  User,
} from "./types";

interface StoreValue extends Dataset {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addUser: (user: Omit<User, "id" | "createdAt"> & { password?: string }) => Promise<User>;
  updateUser: (id: number, patch: Partial<Omit<User, "id">>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: number, patch: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<Category>;
  updateCategory: (id: number, patch: Partial<Omit<Category, "id">>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addOrder: (order: Omit<Order, "id">, paymentStatus: PaymentStatus) => Promise<Order>;
  updateOrderStatus: (id: number, status: Order["status"]) => Promise<void>;
  deleteReview: (id: number) => Promise<void>;
}

const emptyDataset: Dataset = {
  users: [],
  categories: [],
  products: [],
  orders: [],
  payments: [],
  reviews: [],
};

const StoreContext = createContext<StoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(emptyDataset);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, categories, products, orders, payments, reviews] = await Promise.all([
        apiFetch<User[]>("/users"),
        apiFetch<Category[]>("/categories"),
        apiFetch<Product[]>("/products"),
        apiFetch<Order[]>("/orders"),
        apiFetch<Payment[]>("/payments"),
        apiFetch<Review[]>("/reviews"),
      ]);

      setData({ users, categories, products, orders, payments, reviews });
    } catch (err: any) {
      console.error("Backend database fetch error:", err);
      const errMsg = err.message || "Could not connect to Railway MySQL Backend API.";
      setError(errMsg);
      toast.error("Database Connection Issue: " + errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const addUser = useCallback(
    async (user: Omit<User, "id" | "createdAt"> & { password?: string }) => {
      const created = await apiFetch<User>("/users", {
        method: "POST",
        body: JSON.stringify(user),
      });
      setData((prev) => ({ ...prev, users: [created, ...prev.users] }));
      return created;
    },
    []
  );

  const updateUser = useCallback(async (id: number, patch: Partial<Omit<User, "id">>) => {
    const updated = await apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, "id">) => {
    const created = await apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    setData((prev) => ({ ...prev, categories: [created, ...prev.categories] }));
    return created;
  }, []);

  const updateCategory = useCallback(async (id: number, patch: Partial<Omit<Category, "id">>) => {
    const updated = await apiFetch<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await apiFetch(`/categories/${id}`, { method: "DELETE" });
    setData((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    const created = await apiFetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    setData((prev) => ({ ...prev, products: [created, ...prev.products] }));
    return created;
  }, []);

  const updateProduct = useCallback(async (id: number, patch: Partial<Omit<Product, "id">>) => {
    const updated = await apiFetch<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    setData((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, "id">, paymentStatus: PaymentStatus) => {
    const created = await apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify({ ...order, paymentStatus }),
    });
    await fetchAllData();
    return created;
  }, [fetchAllData]);

  const updateOrderStatus = useCallback(async (id: number, status: Order["status"]) => {
    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  }, []);

  const deleteReview = useCallback(async (id: number) => {
    await apiFetch(`/reviews/${id}`, { method: "DELETE" });
    setData((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r.id !== id) }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      loading,
      error,
      refresh: fetchAllData,
      addUser,
      updateUser,
      deleteUser,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrderStatus,
      deleteReview,
    }),
    [
      data,
      loading,
      error,
      fetchAllData,
      addUser,
      updateUser,
      deleteUser,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrderStatus,
      deleteReview,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AdminStoreProvider");
  return ctx;
}

export type { Review, Order, Payment, Product, Category, User };
