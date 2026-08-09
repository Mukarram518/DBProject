"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = getReviews;
exports.createReview = createReview;
exports.deleteReview = deleteReview;
const db_1 = __importDefault(require("../config/db"));
async function getReviews(req, res) {
    try {
        const { productId, userId } = req.query;
        let query = "SELECT review_id, product_id, user_id, rating, comment, review_date FROM reviews WHERE 1=1";
        const params = [];
        if (productId) {
            query += " AND product_id = ?";
            params.push(Number(productId));
        }
        if (userId) {
            query += " AND user_id = ?";
            params.push(Number(userId));
        }
        query += " ORDER BY review_id DESC";
        const [rows] = await db_1.default.query(query, params);
        const formattedRows = rows.map((r) => ({
            id: r.review_id,
            productId: r.product_id,
            userId: r.user_id,
            rating: Number(r.rating),
            comment: r.comment || "",
            date: r.review_date ? new Date(r.review_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));
        return res.json({ success: true, data: formattedRows });
    }
    catch (error) {
        console.error("Get reviews error:", error);
        return res.status(500).json({ success: false, message: "Error fetching reviews." });
    }
}
async function createReview(req, res) {
    try {
        const { productId, userId, rating, comment } = req.body;
        if (!productId || !userId || !rating) {
            return res.status(400).json({ success: false, message: "ProductId, userId, and rating are required." });
        }
        const dateToday = new Date().toISOString().slice(0, 10);
        const [result] = await db_1.default.query("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", [Number(productId), Number(userId), Number(rating), comment || ""]);
        return res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                productId: Number(productId),
                userId: Number(userId),
                rating: Number(rating),
                comment: comment || "",
                date: dateToday,
            },
        });
    }
    catch (error) {
        console.error("Create review error:", error);
        return res.status(500).json({ success: false, message: "Error creating review." });
    }
}
async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const [result] = await db_1.default.query("DELETE FROM reviews WHERE review_id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }
        return res.json({ success: true, message: "Review deleted successfully." });
    }
    catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({ success: false, message: "Error deleting review." });
    }
}
