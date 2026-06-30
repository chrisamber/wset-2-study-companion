import type { Metadata } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display-face", weight: ["500", "700"] });
const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Decant — WSET Level 2 study companion",
  description:
    "Decant is an open-source, factually-grounded study companion for the WSET Level 2 Award in Wines — explore grapes, decode labels, compare climates, and quiz yourself.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-9">{children}</main>
        <footer className="border-t border-line/70 px-4 py-7 text-center text-xs text-muted">
          Open-source study companion for the WSET Level 2 Award in Wines · content grounded in the published syllabus · not affiliated with, endorsed by, or sponsored by WSET.
        </footer>
      </body>
    </html>
  );
}
