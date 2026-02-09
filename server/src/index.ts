import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import router from "./router";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// ============================================================================
// SECURITY HEADERS MIDDLEWARE
// ============================================================================
// Must be applied BEFORE other middleware to ensure headers are set correctly
// Configured for production SaaS deployment behind Fly.io

app.use(
  helmet({
    // Strict-Transport-Security: Force HTTPS for 1 year
    // trustProxy: true is required when behind Fly.io reverse proxy
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },

    // Content-Security-Policy: Strict policy for API server
    // Note: This is for the API server. Your frontend should have its own CSP.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Only allow resources from same origin by default
        scriptSrc: ["'self'"], // No inline scripts
        styleSrc: ["'self'"], // No inline styles
        imgSrc: ["'self'", "data:", "https:"], // Allow HTTPS images and data URIs
        connectSrc: [
          "'self'",
          "https://*.supabase.co", // Allow Supabase API calls
          process.env.FRONTEND_URL || "http://localhost:3000", // Allow frontend
        ],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"], // Disable plugins
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"], // No iframes
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // Prevent clickjacking (same as X-Frame-Options: DENY)
        upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
      },
    },

    // X-Frame-Options: Prevent clickjacking
    // Using 'DENY' since this is an API server
    frameguard: {
      action: "deny",
    },

    // X-Content-Type-Options: Prevent MIME sniffing
    noSniff: true,

    // Referrer-Policy: Control referrer information
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },

    // Permissions-Policy: Restrict browser features
    permittedCrossDomainPolicies: {
      permittedPolicies: "none",
    },

    // X-DNS-Prefetch-Control: Control DNS prefetching
    dnsPrefetchControl: {
      allow: false,
    },

    // X-Download-Options: Prevent IE from executing downloads
    ieNoOpen: true,

    // X-Powered-By: Remove Express fingerprint
    hidePoweredBy: true,
  }),
);

// Additional Permissions-Policy header (not covered by helmet)
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );
  next();
});

// Trust proxy - CRITICAL for Fly.io deployment
// This ensures HSTS and secure cookies work correctly behind the reverse proxy
app.set("trust proxy", 1);

// ============================================================================
// STANDARD MIDDLEWARE
// ============================================================================

// CORS - Must come AFTER helmet to avoid conflicts
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
