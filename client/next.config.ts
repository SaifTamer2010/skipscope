import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================================================
  // SECURITY HEADERS CONFIGURATION
  // ============================================================================
  // Production-ready headers for Vercel deployment
  // Configured for Next.js SaaS application with Supabase

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // ====================================================================
          // Strict-Transport-Security (HSTS)
          // ====================================================================
          // Forces HTTPS for 2 years, includes subdomains
          // Vercel automatically handles HTTPS, this ensures browsers enforce it
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // ====================================================================
          // Content-Security-Policy (CSP)
          // ====================================================================
          // IMPORTANT: This is a strict policy for production SaaS
          // Allows: Next.js, Supabase, Vercel Analytics, external images
          {
            key: "Content-Security-Policy",
            value: [
              // Default: only same-origin resources
              "default-src 'self'",

              // Scripts: Next.js requires 'unsafe-eval' for dev, 'unsafe-inline' for some features
              // For production, consider using nonces instead of 'unsafe-inline'
              // Vercel Analytics requires 'unsafe-inline' and vercel domains
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel-scripts.com",

              // Styles: Next.js uses inline styles, required for styled-jsx and CSS-in-JS
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Images: Allow same-origin, data URIs, HTTPS images, and Supabase storage
              "img-src 'self' data: https: blob: https://*.supabase.co",

              // Fonts: Google Fonts and data URIs
              "font-src 'self' data: https://fonts.gstatic.com",

              // Connect (API calls): Backend API, Supabase, Vercel Analytics
              // ADJUST: Replace localhost with your production API domain
              "connect-src 'self' http://localhost:5000 https://*.supabase.co https://vercel.live wss://*.supabase.co",

              // Media: same-origin and Supabase
              "media-src 'self' https://*.supabase.co",

              // Objects: Disable plugins
              "object-src 'none'",

              // Base URI: Restrict to same origin
              "base-uri 'self'",

              // Form actions: Only same origin
              "form-action 'self'",

              // Frame ancestors: Prevent clickjacking (same as X-Frame-Options)
              "frame-ancestors 'none'",

              // Frames: Allow same-origin (for potential iframes in your app)
              // Change to 'none' if you don't use iframes
              "frame-src 'self' https://*.supabase.co",

              // Upgrade insecure requests (HTTP -> HTTPS)
              "upgrade-insecure-requests",

              // Block mixed content
              "block-all-mixed-content",
            ].join("; "),
          },

          // ====================================================================
          // X-Frame-Options
          // ====================================================================
          // Prevents clickjacking by blocking iframe embedding
          // Using DENY since this is a SaaS app (not meant to be embedded)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // ====================================================================
          // X-Content-Type-Options
          // ====================================================================
          // Prevents MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // ====================================================================
          // Referrer-Policy
          // ====================================================================
          // Controls referrer information sent with requests
          // strict-origin-when-cross-origin: Full URL for same-origin, only origin for cross-origin HTTPS
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // ====================================================================
          // Permissions-Policy
          // ====================================================================
          // Restricts browser features to prevent unauthorized access
          // Blocks: camera, microphone, geolocation, payment, etc.
          // ADJUST: Enable features your app actually needs
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "interest-cohort=()", // Disable FLoC
              "payment=()",
              "usb=()",
              "magnetometer=()",
              "gyroscope=()",
              "accelerometer=()",
              "ambient-light-sensor=()",
              "autoplay=()",
              "encrypted-media=()",
              "fullscreen=(self)", // Allow fullscreen on same origin
              "picture-in-picture=()",
            ].join(", "),
          },

          // ====================================================================
          // X-DNS-Prefetch-Control
          // ====================================================================
          // Controls DNS prefetching for performance/privacy balance
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          // ====================================================================
          // X-Download-Options
          // ====================================================================
          // Prevents IE from executing downloads in site's context
          {
            key: "X-Download-Options",
            value: "noopen",
          },

          // ====================================================================
          // X-Permitted-Cross-Domain-Policies
          // ====================================================================
          // Restricts Adobe Flash and PDF cross-domain requests
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },

  // ============================================================================
  // ADDITIONAL NEXT.JS CONFIGURATION
  // ============================================================================

  // Image optimization domains (for next/image)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
    ],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable React strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
