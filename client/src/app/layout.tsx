// src/app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SkipScope",
  description: "At skipscope you scope what you want and we Skip it wink wink",
  icons: {
    icon: "/favicon.png", // Path is relative to the public directory
    apple: "/favicon.png",
  },
  openGraph: {
    title: "My Awesome Website",
    description: "A website built with Next.js.",
    url: "https://mywebsite.com",
    siteName: "My Awesome Website",
    images: [
      {
        url: "https://mywebsite.com",
        width: 800,
        height: 600,
        alt: "My Awesome Website Open Graph Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0d0d0d",
              color: "#f2f2f2",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
