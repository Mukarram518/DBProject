export type UserRole = "Admin" | "Manager" | "User";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  description: string;
}

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
export type PaymentMethod = "Credit Card" | "Debit Card" | "Cash on Delivery" | "Bank Transfer" | "EasyPaisa";
export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  date: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  date: string;
}

export interface Dataset {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  reviews: Review[];
}
