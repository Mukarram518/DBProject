import { Request, Response } from "express";
import pool from "../config/db";

export async function getOrders(req: Request, res: Response) {
  try {
    const [orders]: any = await pool.query(
      "SELECT o.order_id, o.user_id, o.order_date, o.total_amount, o.order_status, p.payment_method FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id ORDER BY o.order_id DESC"
    );
    const [items]: any = await pool.query("SELECT order_id, product_id, quantity, price FROM order_items");

    const itemMap = new Map<number, any[]>();
    for (const item of items) {
      if (!itemMap.has(item.order_id)) {
        itemMap.set(item.order_id, []);
      }
      itemMap.get(item.order_id)!.push({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: Number(item.price),
      });
    }

    const formattedOrders = orders.map((o: any) => ({
      id: o.order_id,
      userId: o.user_id,
      date: o.order_date ? new Date(o.order_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: o.order_status === "Shipped" || o.order_status === "Delivered" ? "Completed" : o.order_status,
      paymentMethod: o.payment_method || "Credit Card",
      items: itemMap.get(o.order_id) || [],
    }));

    return res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: "Error fetching orders." });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      "SELECT o.order_id, o.user_id, o.order_date, o.total_amount, o.order_status, p.payment_method FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id WHERE o.order_id = ? LIMIT 1",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const order = rows[0];
    const [items]: any = await pool.query("SELECT product_id, quantity, price FROM order_items WHERE order_id = ?", [id]);

    const formattedItems = items.map((i: any) => ({
      productId: i.product_id,
      quantity: i.quantity,
      unitPrice: Number(i.price),
    }));

    return res.json({
      success: true,
      data: {
        id: order.order_id,
        userId: order.user_id,
        date: order.order_date ? new Date(order.order_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        status: order.order_status === "Shipped" || order.order_status === "Delivered" ? "Completed" : order.order_status,
        paymentMethod: order.payment_method || "Credit Card",
        items: formattedItems,
      },
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({ success: false, message: "Error fetching order details." });
  }
}

export async function createOrder(req: Request, res: Response) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { userId, paymentMethod, items, paymentStatus = "Pending" } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: "Invalid order request. User ID and items are required." });
    }

    const dateToday = new Date().toISOString().slice(0, 10);
    const initialStatus = "Pending";

    let totalAmount = 0;
    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);
      totalAmount += quantity * unitPrice;
    }

    const [orderResult]: any = await connection.query(
      "INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, ?)",
      [userId, totalAmount, initialStatus]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);

      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, quantity, unitPrice]
      );
    }

    const dbPayMethod = paymentMethod === "EasyPaisa" ? "Cash" : paymentMethod || "Credit Card";
    const dbPayStatus = paymentStatus === "Paid" ? "Completed" : paymentStatus;

    await connection.query(
      "INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)",
      [orderId, totalAmount, dbPayMethod, dbPayStatus]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      data: {
        id: orderId,
        userId: Number(userId),
        date: dateToday,
        status: initialStatus,
        paymentMethod: paymentMethod || "Credit Card",
        items,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Create order error:", error);
    return res.status(500).json({ success: false, message: "Error creating order." });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Order status is required." });
    }

    const dbStatus = status === "Completed" ? "Delivered" : status;

    const [result]: any = await pool.query("UPDATE orders SET order_status = ? WHERE order_id = ?", [dbStatus, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (status === "Completed") {
      await pool.query("UPDATE payments SET payment_status = 'Completed' WHERE order_id = ?", [id]);
    }

    return res.json({ success: true, message: "Order status updated successfully.", status });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ success: false, message: "Error updating order status." });
  }
}
