import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LittleSparks — Where Little Minds Ignite Big Ideas",
  description:
    "A fun, engaging learning platform for kids ages 6-14. Master Vedic Maths, Abacus, and STEM with interactive lessons and games.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-body antialiased">
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
