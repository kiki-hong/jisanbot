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

import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: config.chatbotName,
  description: "한의학 지식 기반 AI 상담 컨설턴트",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  openGraph: {
    title: config.chatbotName,
    description: "한의학 지식 기반 AI 상담 컨설턴트",
    url: "https://jisanbot.vercel.app",
    siteName: config.chatbotName,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "한의학 AI 컨설턴트",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.chatbotName,
    description: "한의학 지식 기반 AI 상담 컨설턴트",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
