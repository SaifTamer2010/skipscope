import express from "express";
import cors from "cors";
import dotenv from "dotenv";
var morgan = require("morgan");
import router from "./router";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// ============================================================================
// SECURITY HEADERS MIDDLEWARE
// ============================================================================
// Manual implementation of security headers (no helmet dependency)
// Configured for production SaaS deployment behind Fly.io

app.use((req, res, next) => {
  // Strict-Transport-Security: Force HTTPS for 1 year
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Content-Security-Policy: Strict policy for API server
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data: https:",
      `connect-src 'self' https://*.supabase.co ${process.env.FRONTEND_URL || "http://localhost:3000"}`,
      "font-src 'self' data:",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  // X-Frame-Options: Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // X-Content-Type-Options: Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Referrer-Policy: Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: Restrict browser features
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );

  // X-DNS-Prefetch-Control: Control DNS prefetching
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // X-Download-Options: Prevent IE from executing downloads
  res.setHeader("X-Download-Options", "noopen");

  // X-Permitted-Cross-Domain-Policies: Restrict cross-domain policies
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  next();
});

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
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Security headers: ENABLED`);
});
