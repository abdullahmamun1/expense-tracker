import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import walletsRoutes from "./modules/wallets/wallet.routes.js";
import categoriesRoutes from "./modules/categories/category.routes.js";
import transactionsRoutes from "./modules/transactions/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import budgetsRoutes from "./modules/budgets/budget.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import { corsMiddleware } from "./config/cors.js";
import { sessionMiddleware } from "./config/session.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/reports", reportsRoutes);

app.use(errorHandler);
