import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { testConnection } from "./config/db";
import { initializeDatabaseSchema } from "./services/dbInit";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import reportRoutes from "./routes/report.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// Middleware
app.use(cors({ origin: env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get("/api/health", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: "ok",
    environment: env.NODE_ENV,
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Bootstrap
async function startServer() {
  const isDbReady = await testConnection();
  if (isDbReady) {
    await initializeDatabaseSchema();
  } else {
    console.warn("Database connection could not be established at startup. Waiting for environment variables...");
  }

  app.listen(env.PORT, () => {
    console.log(`E-Commerce Backend API running on port ${env.PORT} (http://localhost:${env.PORT})`);
  });
}

startServer();
