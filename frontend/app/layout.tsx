// filepath: frontend/app/layout.tsx
// description: Root layout — server component with metadata, Inter font, and LenisProvider.

import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { LenisProvider } from "./_components/LenisProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Creator",
  description: "AI-powered educational platform for teachers to automatically generate structured assessments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bricolage.variable} font-sans`}>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
