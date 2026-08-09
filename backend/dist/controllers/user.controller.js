"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
async function getUsers(req, res) {
    try {
        const { search, role, status } = req.query;
        let query = "SELECT user_id, first_name, last_name, email, phone, role, status, created_at FROM users WHERE 1=1";
        const params = [];
        if (search) {
            query += " AND (LOWER(first_name) LIKE ? OR LOWER(COALESCE(last_name, '')) LIKE ? OR LOWER(email) LIKE ?)";
            const term = `%${String(search).toLowerCase()}%`;
            params.push(term, term, term);
        }
        if (role && role !== "all") {
            const dbRole = role === "User" ? "Customer" : role;
            query += " AND role = ?";
            params.push(dbRole);
        }
        if (status && status !== "all") {
            query += " AND status = ?";
            params.push(status);
        }
        query += " ORDER BY user_id DESC";
        const [rows] = await db_1.default.query(query, params);
        const formattedRows = rows.map((r) => ({
            id: r.user_id,
            name: `${r.first_name}${r.last_name ? " " + r.last_name : ""}`.trim(),
            email: r.email,
            phone: r.phone || "",
            role: r.role === "Customer" ? "User" : r.role,
            status: r.status || "Active",
            createdAt: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));
        return res.json({ success: true, data: formattedRows });
    }
    catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({ success: false, message: "Error fetching users." });
    }
}
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const [rows] = await db_1.default.query("SELECT user_id, first_name, last_name, email, phone, role, status, created_at FROM users WHERE user_id = ? LIMIT 1", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const r = rows[0];
        return res.json({
            success: true,
            data: {
                id: r.user_id,
                name: `${r.first_name}${r.last_name ? " " + r.last_name : ""}`.trim(),
                email: r.email,
                phone: r.phone || "",
                role: r.role === "Customer" ? "User" : r.role,
                status: r.status || "Active",
                createdAt: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            },
        });
    }
    catch (error) {
        console.error("Get user by id error:", error);
        return res.status(500).json({ success: false, message: "Error fetching user." });
    }
}
async function createUser(req, res) {
    try {
        const { name, email, phone, role = "User", status = "Active", password } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and email are required." });
        }
        const [existing] = await db_1.default.query("SELECT user_id FROM users WHERE email = ? LIMIT 1", [email]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: "A user with this email already exists." });
        }
        const nameParts = String(name).trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";
        const dbRole = role === "User" ? "Customer" : role;
        const hashedPassword = password ? await bcryptjs_1.default.hash(password, 10) : await bcryptjs_1.default.hash("password123", 10);
        const dateToday = new Date().toISOString().slice(0, 10);
        const [result] = await db_1.default.query("INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [firstName, lastName, email, hashedPassword, phone || null, dbRole === "Admin" ? "Admin" : "Customer", status]);
        const newUser = {
            id: result.insertId,
            name: `${firstName}${lastName ? " " + lastName : ""}`.trim(),
            email,
            phone: phone || "",
            role: dbRole === "Customer" ? "User" : dbRole,
            status,
            createdAt: dateToday,
        };
        return res.status(201).json({ success: true, data: newUser });
    }
    catch (error) {
        console.error("Create user error:", error);
        return res.status(500).json({ success: false, message: "Error creating user." });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, phone, role, status } = req.body;
        const [rows] = await db_1.default.query("SELECT * FROM users WHERE user_id = ? LIMIT 1", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const currentUser = rows[0];
        let firstName = currentUser.first_name;
        let lastName = currentUser.last_name || "";
        if (name !== undefined) {
            const nameParts = String(name).trim().split(" ");
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(" ") || "";
        }
        const updatedEmail = email !== undefined ? email : currentUser.email;
        const updatedPhone = phone !== undefined ? phone : currentUser.phone;
        const updatedRole = role !== undefined ? (role === "User" ? "Customer" : role) : currentUser.role;
        const updatedStatus = status !== undefined ? status : currentUser.status;
        await db_1.default.query("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, status = ? WHERE user_id = ?", [firstName, lastName, updatedEmail, updatedPhone, updatedRole === "Admin" ? "Admin" : "Customer", updatedStatus, id]);
        return res.json({
            success: true,
            data: {
                id: Number(id),
                name: `${firstName}${lastName ? " " + lastName : ""}`.trim(),
                email: updatedEmail,
                phone: updatedPhone || "",
                role: updatedRole === "Customer" ? "User" : updatedRole,
                status: updatedStatus,
                createdAt: currentUser.created_at ? new Date(currentUser.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            },
        });
    }
    catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({ success: false, message: "Error updating user." });
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const [result] = await db_1.default.query("DELETE FROM users WHERE user_id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.json({ success: true, message: "User deleted successfully." });
    }
    catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ success: false, message: "Error deleting user." });
    }
}
