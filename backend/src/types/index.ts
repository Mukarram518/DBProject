import { Request } from "express";

export type UserRole = "Admin" | "Manager" | "User";
export type UserStatus = "Active" | "Inactive";

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface CategoryEntity {
  id: number;
  name: string;
  description: string;
}

export interface ProductEntity {
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

export interface OrderItemEntity {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderEntity {
  id: number;
  userId: number;
  date: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItemEntity[];
}

export interface PaymentEntity {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface ReviewEntity {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  date: string;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}
