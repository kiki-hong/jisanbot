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
  metadataBase: new URL("https://jisanbot.vercel.app"),
  title: "지식산업센터 AI 컨설턴트",
  description: "지식산업센터 입주, 분양, 법률, 세무 관련 AI 상담 챗봇입니다.",
  openGraph: {
    title: "지식산업센터 AI 컨설턴트",
    description: "지식산업센터 입주, 분양, 법률, 세무 관련 AI 상담 챗봇입니다.",
    images: [
      {
        url: "/og-image.png",
        width: 800,
        height: 600,
        alt: "지식산업센터 AI 컨설턴트",
      },
    ],
    type: "website",
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
