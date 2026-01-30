import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAX | Unlock Your Resonance",
  description: "属性というノイズを捨て、6次元の「本質ベクトル」で繋がる。ZAXはDeep Techによる次世代の人間関係最適化プロトコルです。",
  openGraph: {
    title: "ZAX | Unlock Your Resonance",
    description: "Unlock your hidden potential through vector-based resonance.",
    url: "https://fumiproject.dev",
    siteName: "ZAX Protocol",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAX | Unlock Your Resonance",
    description: "属性を捨て、本質で繋がる。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
