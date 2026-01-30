import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoldTracker - Sổ Vàng Tích Sản",
  description: "Quản lý tài sản vàng hiệu quả, thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 w-full bg-muted/20">{children}</main>
            <ScrollToTop />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
