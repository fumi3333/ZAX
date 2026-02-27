import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAX | Value-Based Connection",
  description: "表面的な属性ではなく、価値観と性格特性で繋がる、新しいマッチングプラットフォーム。",
  openGraph: {
    title: "ZAX | Value-Based Connection",
    description: "Connect through values, not just attributes.",
    url: "https://zax.fumiproject.dev",
    siteName: "ZAX",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAX | Value-Based Connection",
    description: "属性ではなく、価値観で繋がる。",
  },
};

import CorporateHeader from "@/components/CorporateHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50`}
        suppressHydrationWarning
      >
        <CorporateHeader />
        {children}
      </body>
    </html>
  );
}
