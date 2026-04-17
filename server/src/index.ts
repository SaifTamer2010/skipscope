import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
var morgan = require("morgan");
import router from "./router";
import { SlackService } from "./services/slackService";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { requestIdMiddleware } from "./middleware/requestIdMiddleware";
import { globalLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8080);

// ============================================================================
// PROCESS ERROR HANDLERS
// ============================================================================

process.on("uncaughtException", async (error) => {
  console.error("Uncaught Exception:", error);
  await SlackService.notifyError(error, "uncaught");
  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  const error = reason instanceof Error ? reason : new Error(String(reason));
  await SlackService.notifyError(error, "rejection");
});

// Helmet for secure HTTP headers
app.use(helmet());

// Request ID for tracking
app.use(requestIdMiddleware);

// Global rate limiter
app.use(globalLimiter);

// Trust proxy - CRITICAL for Fly.io deployment
// This ensures HSTS and secure cookies work correctly behind the reverse proxy
app.set("trust proxy", 1);

// ============================================================================
// STANDARD MIDDLEWARE
// ============================================================================

// CORS - Must come AFTER security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ============================================================================
// ROUTES
// ============================================================================

app.use("/api", router);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorMiddleware);

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Security headers: ENABLED`);
});
