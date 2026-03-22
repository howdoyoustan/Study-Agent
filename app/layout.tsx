import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Agent — PDF search (WAIP)",
  description: "Ask questions over PDFs via Wipro AI Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
