import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "WSET L2 Companion",
  description:
    "A factually-grounded, interactive study companion for the WSET Level 2 Award in Wines — explore grapes, decode labels, compare climates, and quiz yourself.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-7">{children}</main>
        <footer className="border-t border-line/70 px-4 py-6 text-center text-xs text-muted">
          Study companion for Zeal · content grounded in the WSET L2 syllabus · not affiliated with WSET.
        </footer>
      </body>
    </html>
  );
}
