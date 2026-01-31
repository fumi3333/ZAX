import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CorporateHeader from "@/components/CorporateHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAX | Value-Based Connection",
  description: "表面的な属性ではなく、あなたの「本質」と「価値観」で繋がる、新しいマッチングプラットフォーム。",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CorporateHeader />
        {children}
      </body>
    </html>
  );
}
