import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "wardOS",
  description: "An operating dashboard for ward and quorum coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
