import { Request, Response } from "express";
import pool from "../config/db";

export async function getDashboardOverview(req: Request, res: Response) {
  try {
    const [usersCount]: any = await pool.query("SELECT COUNT(*) as total FROM users");
    const [productsCount]: any = await pool.query("SELECT COUNT(*) as total FROM products");
    const [categoriesCount]: any = await pool.query("SELECT COUNT(*) as total FROM categories");
    const [ordersCount]: any = await pool.query("SELECT COUNT(*) as total FROM orders");

    const [salesResult]: any = await pool.query(
      "SELECT SUM(p.amount) as totalSales FROM payments p JOIN orders o ON p.order_id = o.order_id WHERE o.order_status != 'Cancelled'"
    );

    const [recentOrders]: any = await pool.query(
      "SELECT o.order_id as id, o.user_id as userId, o.order_date as date, o.order_status as status, o.total_amount as totalAmount, p.payment_method as paymentMethod FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id ORDER BY o.order_id DESC LIMIT 6"
    );

    const formattedRecent = recentOrders.map((o: any) => ({
      id: o.id,
      userId: o.userId,
      date: o.date ? new Date(o.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: o.status === "Shipped" || o.status === "Delivered" ? "Completed" : o.status,
      paymentMethod: o.paymentMethod || "Credit Card",
      totalAmount: Number(o.totalAmount || 0),
    }));

    return res.json({
      success: true,
      data: {
        totalUsers: usersCount[0].total,
        totalProducts: productsCount[0].total,
        totalCategories: categoriesCount[0].total,
        totalOrders: ordersCount[0].total,
        totalSales: Number(salesResult[0].totalSales || 0),
        recentOrders: formattedRecent,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return res.status(500).json({ success: false, message: "Error fetching dashboard metrics." });
  }
}
