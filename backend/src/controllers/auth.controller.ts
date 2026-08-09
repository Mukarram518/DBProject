import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { env } from "../config/env";
import { AuthenticatedRequest, UserEntity } from "../types";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user: UserEntity = rows[0];

    // If password exists in DB, compare hash
    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
}

export async function register(req: Request, res: Response) {
  const { name, email, password, phone, role = "User" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." });
  }

  try {
    const [existing]: any = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const dateToday = new Date().toISOString().slice(0, 10);

    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password, phone, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone || "", role, "Active", dateToday]
    );

    const newUserId = result.insertId;
    const token = jwt.sign(
      { userId: newUserId, email, role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: newUserId, name, email, phone: phone || "", role, status: "Active", createdAt: dateToday },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated." });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT id, name, email, phone, role, status, createdAt FROM users WHERE id = ? LIMIT 1",
      [req.user.userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching user details." });
  }
}
