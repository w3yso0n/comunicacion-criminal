import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CENTINELA — Monitoreo narrativo",
  description:
    "Sistema de monitoreo de apología, propaganda criminal y correlación con hechos delictivos públicos (demo).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
