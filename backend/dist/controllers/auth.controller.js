"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const env_1 = require("../config/env");
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    try {
        const [rows] = await db_1.default.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
        if (!rows || rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        const user = rows[0];
        // If password exists in DB, compare hash
        if (user.password) {
            const match = await bcryptjs_1.default.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ success: false, message: "Invalid email or password." });
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...userWithoutPassword } = user;
        return res.json({
            success: true,
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
}
async function register(req, res) {
    const { name, email, password, phone, role = "User" } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    try {
        const [existing] = await db_1.default.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
        if (existing && existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email is already registered." });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const dateToday = new Date().toISOString().slice(0, 10);
        const [result] = await db_1.default.query("INSERT INTO users (name, email, password, phone, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)", [name, email, hashedPassword, phone || "", role, "Active", dateToday]);
        const newUserId = result.insertId;
        const token = jsonwebtoken_1.default.sign({ userId: newUserId, email, role }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            success: true,
            data: {
                token,
                user: { id: newUserId, name, email, phone: phone || "", role, status: "Active", createdAt: dateToday },
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ success: false, message: "Server error during registration." });
    }
}
async function getMe(req, res) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    try {
        const [rows] = await db_1.default.query("SELECT id, name, email, phone, role, status, createdAt FROM users WHERE id = ? LIMIT 1", [req.user.userId]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.json({ success: true, data: rows[0] });
    }
    catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({ success: false, message: "Server error fetching user details." });
    }
}
