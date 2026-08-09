"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const dbInit_1 = require("./services/dbInit");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL || "*", credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check API
app.get("/api/health", async (req, res) => {
    const dbConnected = await (0, db_1.testConnection)();
    res.json({
        status: "ok",
        environment: env_1.env.NODE_ENV,
        database: dbConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/reports", report_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Bootstrap
async function startServer() {
    const isDbReady = await (0, db_1.testConnection)();
    if (isDbReady) {
        await (0, dbInit_1.initializeDatabaseSchema)();
    }
    else {
        console.warn("Database connection could not be established at startup. Waiting for environment variables...");
    }
    app.listen(env_1.env.PORT, () => {
        console.log(`E-Commerce Backend API running on port ${env_1.env.PORT} (http://localhost:${env_1.env.PORT})`);
    });
}
startServer();
