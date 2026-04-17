import rateLimit from "express-rate-limit";

/**
 * Global rate limiter
 * Limits all requests to 100 per 15 minutes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes"
  }
});

/**
 * Stricter rate limiter for skip trace (request submission) endpoints
 * Limits to 20 requests per hour
 */
export const skipTraceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 skip trace attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Skip trace limit reached. Please try again after an hour"
  }
});

/**
 * Auth rate limiter for login/register
 * Limits to 10 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many authentication attempts. Please try again after 15 minutes"
    }
  });
