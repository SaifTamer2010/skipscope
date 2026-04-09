// src/app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SkipScope | Precision Real Estate Intelligence & Skip Tracing",
  description: "Scale your real estate portfolio with SkipScope's high-accuracy skip tracing, bulk lead enrichment, and deep search intelligence. 99.8% accuracy for modern real estate professionals.",
  keywords: ["skip tracing", "real estate leads", "property data", "real estate intelligence", "contact enrichment", "distressed property data"],
  icons: {
    icon: "/favicon.png", // Path is relative to the public directory
    apple: "/favicon.png",
  },
  openGraph: {
    title: "SkipScope | Lead Intelligence for Real Estate Pros",
    description: "Find more deals with the most accurate skip tracing tool on the market. 99.8% precision for wholesalers and investors.",
    url: "https://skipscope.ai",
    siteName: "SkipScope",
    images: [
      {
        url: "/data/hero.png",
        width: 1200,
        height: 630,
        alt: "SkipScope Real Estate Intelligence Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkipScope | Real Estate Skip Tracing & Lead Intelligence",
    description: "Scale your real estate deals with 99.8% accurate data.",
    images: ["/data/hero.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.body.classList.remove('light');
                  } else {
                    document.body.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="light">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--color-background-third)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border-light)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#f2f2f2",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f2f2f2",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
