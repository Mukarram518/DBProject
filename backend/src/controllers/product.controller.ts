import { Request, Response } from "express";
import pool from "../config/db";

export async function getProducts(req: Request, res: Response) {
  try {
    const { search, categoryId } = req.query;
    let query = "SELECT product_id, category_id, product_name, price, stock_quantity, description FROM products WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND (LOWER(product_name) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?)";
      const term = `%${String(search).toLowerCase()}%`;
      params.push(term, term);
    }

    if (categoryId && categoryId !== "all") {
      query += " AND category_id = ?";
      params.push(Number(categoryId));
    }

    query += " ORDER BY product_id DESC";

    const [rows]: any = await pool.query(query, params);

    const formattedRows = rows.map((r: any) => ({
      id: r.product_id,
      name: r.product_name,
      categoryId: r.category_id,
      price: Number(r.price),
      stock: Number(r.stock_quantity),
      description: r.description || "",
    }));

    return res.json({ success: true, data: formattedRows });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Error fetching products." });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      "SELECT product_id, category_id, product_name, price, stock_quantity, description FROM products WHERE product_id = ? LIMIT 1",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const prod = rows[0];
    return res.json({
      success: true,
      data: {
        id: prod.product_id,
        name: prod.product_name,
        categoryId: prod.category_id,
        price: Number(prod.price),
        stock: Number(prod.stock_quantity),
        description: prod.description || "",
      },
    });
  } catch (error) {
    console.error("Get product by id error:", error);
    return res.status(500).json({ success: false, message: "Error fetching product." });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, categoryId, price, stock, description } = req.body;

    if (!name || categoryId === undefined || price === undefined) {
      return res.status(400).json({ success: false, message: "Name, categoryId, and price are required." });
    }

    const [result]: any = await pool.query(
      "INSERT INTO products (product_name, category_id, price, stock_quantity, description) VALUES (?, ?, ?, ?, ?)",
      [name, Number(categoryId), Number(price), Number(stock || 0), description || ""]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        categoryId: Number(categoryId),
        price: Number(price),
        stock: Number(stock || 0),
        description: description || "",
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: "Error creating product." });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, categoryId, price, stock, description } = req.body;

    const [rows]: any = await pool.query("SELECT * FROM products WHERE product_id = ? LIMIT 1", [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const current = rows[0];
    const updatedName = name !== undefined ? name : current.product_name;
    const updatedCategoryId = categoryId !== undefined ? Number(categoryId) : current.category_id;
    const updatedPrice = price !== undefined ? Number(price) : Number(current.price);
    const updatedStock = stock !== undefined ? Number(stock) : current.stock_quantity;
    const updatedDescription = description !== undefined ? description : current.description;

    await pool.query(
      "UPDATE products SET product_name = ?, category_id = ?, price = ?, stock_quantity = ?, description = ? WHERE product_id = ?",
      [updatedName, updatedCategoryId, updatedPrice, updatedStock, updatedDescription, id]
    );

    return res.json({
      success: true,
      data: {
        id: Number(id),
        name: updatedName,
        categoryId: updatedCategoryId,
        price: updatedPrice,
        stock: updatedStock,
        description: updatedDescription || "",
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: "Error updating product." });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ success: false, message: "Error deleting product." });
  }
}
