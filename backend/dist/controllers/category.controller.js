"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const db_1 = __importDefault(require("../config/db"));
async function getCategories(req, res) {
    try {
        const [rows] = await db_1.default.query("SELECT category_id, category_name, description FROM categories ORDER BY category_id ASC");
        const formattedRows = rows.map((r) => ({
            id: r.category_id,
            name: r.category_name,
            description: r.description || "",
        }));
        return res.json({ success: true, data: formattedRows });
    }
    catch (error) {
        console.error("Get categories error:", error);
        return res.status(500).json({ success: false, message: "Error fetching categories." });
    }
}
async function getCategoryById(req, res) {
    try {
        const { id } = req.params;
        const [rows] = await db_1.default.query("SELECT category_id, category_name, description FROM categories WHERE category_id = ? LIMIT 1", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        const r = rows[0];
        return res.json({
            success: true,
            data: {
                id: r.category_id,
                name: r.category_name,
                description: r.description || "",
            },
        });
    }
    catch (error) {
        console.error("Get category by id error:", error);
        return res.status(500).json({ success: false, message: "Error fetching category." });
    }
}
async function createCategory(req, res) {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }
        const [result] = await db_1.default.query("INSERT INTO categories (category_name, description) VALUES (?, ?)", [name, description || ""]);
        return res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                name,
                description: description || "",
            },
        });
    }
    catch (error) {
        console.error("Create category error:", error);
        return res.status(500).json({ success: false, message: "Error creating category." });
    }
}
async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const [rows] = await db_1.default.query("SELECT * FROM categories WHERE category_id = ? LIMIT 1", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        const current = rows[0];
        const updatedName = name !== undefined ? name : current.category_name;
        const updatedDescription = description !== undefined ? description : current.description;
        await db_1.default.query("UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?", [
            updatedName,
            updatedDescription,
            id,
        ]);
        return res.json({
            success: true,
            data: {
                id: Number(id),
                name: updatedName,
                description: updatedDescription || "",
            },
        });
    }
    catch (error) {
        console.error("Update category error:", error);
        return res.status(500).json({ success: false, message: "Error updating category." });
    }
}
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        const [result] = await db_1.default.query("DELETE FROM categories WHERE category_id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        return res.json({ success: true, message: "Category deleted successfully." });
    }
    catch (error) {
        console.error("Delete category error:", error);
        return res.status(500).json({ success: false, message: "Error deleting category." });
    }
}
