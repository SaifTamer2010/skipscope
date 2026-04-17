// src/app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://skipscope.com"),
  title: "SkipScope | Precision Real Estate Search & Skip Tracing",
  description: "Scale your real estate portfolio with SkipScope's high-accuracy skip tracing, bulk lead enrichment, and deep search analytics. 99.8% accuracy for modern real estate professionals.",
  keywords: ["skip tracing", "real estate leads", "property data", "real estate analytics", "contact enrichment", "distressed property data"],
  icons: {
    icon: "/favicon.png", // Path is relative to the public directory
    apple: "/favicon.png",
  },
  openGraph: {
    title: "SkipScope | Lead Search for Real Estate Pros",
    description: "Find more deals with the most accurate skip tracing tool on the market. 99.8% precision for wholesalers and investors.",
    url: "https://skipscope.com",
    siteName: "SkipScope",
    images: [
      {
        url: "/data/hero.png",
        width: 1200,
        height: 630,
        alt: "SkipScope Real Estate Search Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkipScope | Real Estate Skip Tracing & Lead Search",
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
                  const theme = localStorage.getItem('theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>


        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              fontWeight: "600",
              padding: "16px 20px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#000000",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
