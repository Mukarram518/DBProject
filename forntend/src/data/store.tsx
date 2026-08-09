import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { initialDataset } from "./generate";
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

const StoreContext = createContext<StoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(initialDataset);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, categories, products, orders, payments, reviews] = await Promise.all([
        apiFetch<User[]>("/users").catch(() => initialDataset.users),
        apiFetch<Category[]>("/categories").catch(() => initialDataset.categories),
        apiFetch<Product[]>("/products").catch(() => initialDataset.products),
        apiFetch<Order[]>("/orders").catch(() => initialDataset.orders),
        apiFetch<Payment[]>("/payments").catch(() => initialDataset.payments),
        apiFetch<Review[]>("/reviews").catch(() => initialDataset.reviews),
      ]);

      setData({ users, categories, products, orders, payments, reviews });
    } catch (err: any) {
      console.warn("Failed to fetch live database data, falling back to mock dataset:", err);
      setError(err.message || "Failed to load database content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const addUser = useCallback(
    async (user: Omit<User, "id" | "createdAt"> & { password?: string }) => {
      try {
        const created = await apiFetch<User>("/users", {
          method: "POST",
          body: JSON.stringify(user),
        });
        setData((prev) => ({ ...prev, users: [created, ...prev.users] }));
        return created;
      } catch (err) {
        console.error("API addUser failed, falling back locally:", err);
        const fallback: User = {
          ...user,
          id: Date.now(),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((prev) => ({ ...prev, users: [fallback, ...prev.users] }));
        return fallback;
      }
    },
    []
  );

  const updateUser = useCallback(async (id: number, patch: Partial<Omit<User, "id">>) => {
    try {
      const updated = await apiFetch<User>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      }));
    } catch (err) {
      console.error("API updateUser failed, updating locally:", err);
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      }));
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("API deleteUser error:", err);
    }
    setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, "id">) => {
    try {
      const created = await apiFetch<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(category),
      });
      setData((prev) => ({ ...prev, categories: [created, ...prev.categories] }));
      return created;
    } catch (err) {
      console.error("API addCategory failed, falling back locally:", err);
      const fallback: Category = { ...category, id: Date.now() };
      setData((prev) => ({ ...prev, categories: [fallback, ...prev.categories] }));
      return fallback;
    }
  }, []);

  const updateCategory = useCallback(async (id: number, patch: Partial<Omit<Category, "id">>) => {
    try {
      const updated = await apiFetch<Category>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      }));
    } catch (err) {
      console.error("API updateCategory error:", err);
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    }
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("API deleteCategory error:", err);
    }
    setData((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      const created = await apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(product),
      });
      setData((prev) => ({ ...prev, products: [created, ...prev.products] }));
      return created;
    } catch (err) {
      console.error("API addProduct failed, falling back locally:", err);
      const fallback: Product = { ...product, id: Date.now() };
      setData((prev) => ({ ...prev, products: [fallback, ...prev.products] }));
      return fallback;
    }
  }, []);

  const updateProduct = useCallback(async (id: number, patch: Partial<Omit<Product, "id">>) => {
    try {
      const updated = await apiFetch<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      }));
    } catch (err) {
      console.error("API updateProduct error:", err);
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("API deleteProduct error:", err);
    }
    setData((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, []);

  const addOrder = useCallback(async (order: Omit<Order, "id">, paymentStatus: PaymentStatus) => {
    try {
      const created = await apiFetch<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({ ...order, paymentStatus }),
      });
      // Refresh list to update orders and payments
      fetchAllData();
      return created;
    } catch (err) {
      console.error("API addOrder failed, falling back locally:", err);
      const fallback: Order = { ...order, id: Date.now() };
      setData((prev) => ({ ...prev, orders: [fallback, ...prev.orders] }));
      return fallback;
    }
  }, [fetchAllData]);

  const updateOrderStatus = useCallback(async (id: number, status: Order["status"]) => {
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }));
    } catch (err) {
      console.error("API updateOrderStatus error:", err);
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }));
    }
  }, []);

  const deleteReview = useCallback(async (id: number) => {
    try {
      await apiFetch(`/reviews/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("API deleteReview error:", err);
    }
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
