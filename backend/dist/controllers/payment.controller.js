"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
const db_1 = __importDefault(require("../config/db"));
async function getPayments(req, res) {
    try {
        const { method, status } = req.query;
        let query = "SELECT payment_id, order_id, payment_date, amount, payment_method, payment_status FROM payments WHERE 1=1";
        const params = [];
        if (method && method !== "all") {
            const dbMethod = method === "EasyPaisa" ? "Cash" : method;
            query += " AND payment_method = ?";
            params.push(dbMethod);
        }
        if (status && status !== "all") {
            const dbStatus = status === "Paid" ? "Completed" : status;
            query += " AND payment_status = ?";
            params.push(dbStatus);
        }
        query += " ORDER BY payment_id DESC";
        const [rows] = await db_1.default.query(query, params);
        const formattedRows = rows.map((r) => ({
            id: r.payment_id,
            orderId: r.order_id,
            amount: Number(r.amount),
            method: r.payment_method === "Cash" ? "Cash on Delivery" : r.payment_method,
            status: r.payment_status === "Completed" ? "Paid" : r.payment_status,
            date: r.payment_date ? new Date(r.payment_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));
        return res.json({ success: true, data: formattedRows });
    }
    catch (error) {
        console.error("Get payments error:", error);
        return res.status(500).json({ success: false, message: "Error fetching payments." });
    }
}
