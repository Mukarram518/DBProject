import pool from "../config/db";
import bcrypt from "bcryptjs";

export async function initializeDatabaseSchema() {
  const connection = await pool.getConnection();
  try {
    console.log("Safely checking Railway MySQL database columns & missing fields...");

    // Helper to check if a column exists in a table
    const columnExists = async (table: string, column: string): Promise<boolean> => {
      const [rows]: any = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
      );
      return rows && rows.length > 0;
    };

    // Safely add missing columns to existing Railway tables without breaking anything
    if (!(await columnExists("categories", "description"))) {
      await connection.query("ALTER TABLE categories ADD COLUMN description TEXT NULL;");
    }

    if (!(await columnExists("products", "description"))) {
      await connection.query("ALTER TABLE products ADD COLUMN description TEXT NULL;");
    }

    if (!(await columnExists("users", "status"))) {
      await connection.query("ALTER TABLE users ADD COLUMN status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active';");
    }

    if (!(await columnExists("users", "created_at"))) {
      await connection.query("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
    }

    console.log("Railway MySQL schema check complete.");

    // Seed initial data if tables are empty
    await seedInitialData(connection);
  } catch (error) {
    console.error("Error during database schema verification:", error);
  } finally {
    connection.release();
  }
}

async function seedInitialData(connection: any) {
  // 1. Seed Categories if empty
  const [catCount]: any = await connection.query("SELECT COUNT(*) as count FROM categories");
  if (catCount[0].count === 0) {
    console.log("Seeding Railway categories...");
    const categories = [
      ["Electronics", "Phones, laptops, audio gear and everyday tech accessories."],
      ["Clothing", "Men's and women's apparel across all seasons."],
      ["Home & Kitchen", "Cookware, small appliances and home essentials."],
      ["Books", "Fiction, non-fiction, academic titles and stationery."],
      ["Sports & Outdoors", "Fitness equipment, sportswear and outdoor gear."],
      ["Beauty & Personal Care", "Skincare, haircare and grooming products."],
      ["Toys & Games", "Board games, puzzles and toys for all ages."],
      ["Footwear", "Sneakers, formal shoes, sandals and boots."],
    ];

    for (const c of categories) {
      await connection.query("INSERT INTO categories (category_name, description) VALUES (?, ?)", c);
    }
  }

  // 2. Seed Users if empty
  const [usersCount]: any = await connection.query("SELECT COUNT(*) as count FROM users");
  if (usersCount[0].count === 0) {
    console.log("Seeding Railway users...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const initialUsers = [
      ["Admin", "User", "admin@shop.com", hashedPassword, "+92 300 1234567", "Admin", "Active"],
      ["Manager", "Person", "manager@shop.com", hashedPassword, "+92 301 7654321", "Admin", "Active"],
      ["Ali", "Ahmed", "ali.ahmed@example.com", hashedPassword, "+92 321 9876543", "Customer", "Active"],
      ["Fatima", "Raza", "fatima.raza@example.com", hashedPassword, "+92 333 4567890", "Customer", "Active"],
      ["Usman", "Khan", "usman.khan@example.com", hashedPassword, "+92 345 1122334", "Customer", "Active"],
    ];

    for (const u of initialUsers) {
      await connection.query(
        "INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        u
      );
    }
  }

  // 3. Seed Products if empty
  const [prodCount]: any = await connection.query("SELECT COUNT(*) as count FROM products");
  if (prodCount[0].count === 0) {
    console.log("Seeding Railway products...");
    const [cats]: any = await connection.query("SELECT category_id, category_name FROM categories");
    const catMap = new Map<string, number>();
    for (const cat of cats) catMap.set(cat.category_name, cat.category_id);

    const products = [
      ["Wireless Mouse", catMap.get("Electronics") || 1, 29.99, 45, "Ergonomic 2.4G wireless mouse with silent clicks."],
      ["Mechanical Keyboard", catMap.get("Electronics") || 1, 89.99, 20, "RGB mechanical keyboard with tactile blue switches."],
      ["Bluetooth Speaker", catMap.get("Electronics") || 1, 49.99, 35, "Portable waterproof speaker with deep bass."],
      ["Noise Cancelling Headphones", catMap.get("Electronics") || 1, 149.99, 15, "Over-ear active noise cancelling headphones."],
      ["Cotton T-Shirt", catMap.get("Clothing") || 2, 19.99, 100, "100% premium breathable cotton crewneck t-shirt."],
      ["Denim Jacket", catMap.get("Clothing") || 2, 69.99, 30, "Classic indigo denim jacket with regular fit."],
      ["Electric Kettle", catMap.get("Home & Kitchen") || 3, 34.99, 40, "1.7L stainless steel fast boiling electric kettle."],
      ["Air Fryer", catMap.get("Home & Kitchen") || 3, 99.99, 25, "Digital air fryer with 8 preset cooking functions."],
      ["Modern SQL Handbook", catMap.get("Books") || 4, 39.99, 50, "Comprehensive guide to relational database query optimization."],
      ["Yoga Mat", catMap.get("Sports & Outdoors") || 5, 24.99, 60, "Non-slip eco-friendly exercise yoga mat."],
    ];

    for (const p of products) {
      await connection.query(
        "INSERT INTO products (product_name, category_id, price, stock_quantity, description) VALUES (?, ?, ?, ?, ?)",
        p
      );
    }
  }

  // 4. Seed Orders & Payments if empty
  const [orderCount]: any = await connection.query("SELECT COUNT(*) as count FROM orders");
  if (orderCount[0].count === 0) {
    console.log("Seeding Railway orders...");
    const [uRows]: any = await connection.query("SELECT user_id FROM users LIMIT 3");
    const [pRows]: any = await connection.query("SELECT product_id, price FROM products LIMIT 3");

    if (uRows.length > 0 && pRows.length > 0) {
      const uId = uRows[0].user_id;
      const pId = pRows[0].product_id;
      const pPrice = Number(pRows[0].price);

      const [ordRes]: any = await connection.query(
        "INSERT INTO orders (user_id, total_amount, order_status) VALUES (?, ?, ?)",
        [uId, pPrice * 2, "Delivered"]
      );
      const orderId = ordRes.insertId;

      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, pId, 2, pPrice]
      );

      await connection.query(
        "INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)",
        [orderId, pPrice * 2, "Credit Card", "Completed"]
      );
    }
  }
}
