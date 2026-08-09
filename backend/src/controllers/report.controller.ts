import { Request, Response } from "express";
import pool from "../config/db";

export async function getAnalyticsReport(req: Request, res: Response) {
  try {
    const [categorySales]: any = await pool.query(`
      SELECT c.category_name as categoryName, COUNT(DISTINCT oi.order_id) as totalOrders, SUM(oi.quantity * oi.price) as revenue
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_status != 'Cancelled'
      GROUP BY c.category_id, c.category_name
    `);

    const [topCustomers]: any = await pool.query(`
      SELECT u.user_id as id, CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as name, u.email, COUNT(o.order_id) as ordersCount, SUM(p.amount) as totalSpent
      FROM users u
      JOIN orders o ON u.user_id = o.user_id AND o.order_status != 'Cancelled'
      JOIN payments p ON o.order_id = p.order_id
      GROUP BY u.user_id, u.first_name, u.last_name, u.email
      ORDER BY totalSpent DESC
      LIMIT 5
    `);

    const [lowStockProducts]: any = await pool.query(`
      SELECT product_id as id, product_name as name, stock_quantity as stock, price FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC
    `);

    return res.json({
      success: true,
      data: {
        categorySales: categorySales.map((c: any) => ({
          ...c,
          revenue: Number(c.revenue || 0),
        })),
        topCustomers: topCustomers.map((tc: any) => ({
          ...tc,
          name: String(tc.name).trim(),
          totalSpent: Number(tc.totalSpent || 0),
        })),
        lowStockProducts: lowStockProducts.map((lsp: any) => ({
          ...lsp,
          price: Number(lsp.price),
        })),
      },
    });
  } catch (error) {
    console.error("Get analytics report error:", error);
    return res.status(500).json({ success: false, message: "Error fetching analytics report." });
  }
}
